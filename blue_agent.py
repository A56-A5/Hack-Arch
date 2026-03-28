# blue_agent.py
import json
import os
import datetime
from dotenv import load_dotenv
from openai import OpenAI
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import ast

load_dotenv()

PROJECT_ROOT = "./vul_app"
REPORT_PATH = "./vul_report.json"
PDF_REPORT_PATH = "./patch_report.pdf"

# ── OPENAI CLIENT ─────────────────────────────────────
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": "http://localhost",
        "X-Title": "blue-agent"
    }
)

# ── READ FILES ────────────────────────────────────────
def read_all_files():
    files = {}
    for root, _, filenames in os.walk(PROJECT_ROOT):
        for f in filenames:
            if f.endswith(".py"):
                path = os.path.join(root, f)
                try:
                    with open(path, "r", encoding="utf-8") as file:
                        files[os.path.relpath(path, PROJECT_ROOT)] = file.read()
                except:
                    continue
    return files

# ── LOAD REPORT ───────────────────────────────────────
def load_report():
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# ── CLEAN LLM JSON ────────────────────────────────────
def extract_json(raw):
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        if len(parts) >= 2:
            raw = parts[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    if raw.endswith("```"):
        raw = raw[:-3].strip()
    return raw

# ── EXTRACT VULNERABLE SNIPPETS USING AST ─────────────
def get_vulnerable_snippets(files, report):
    """
    Returns {file_path: [list of vulnerable code snippets]}
    """
    snippets = {}
    for fpath, content in files.items():
        try:
            tree = ast.parse(content)
        except:
            continue

        vuln_list = []
        for finding in report.get("findings", []):
            endpoint = finding.get("endpoint", "")
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    # check if endpoint name appears in function body (simplistic)
                    func_body = "\n".join([ast.get_source_segment(content, n) or "" for n in node.body])
                    if endpoint.strip("/") in func_body or endpoint.strip("/") in node.name:
                        snippet = ast.get_source_segment(content, node)
                        if snippet:
                            vuln_list.append(snippet)
        if vuln_list:
            snippets[fpath] = vuln_list
    return snippets

# ── BUILD OPTIONAL CONTEXT ───────────────────────────
def build_context(files):
    context = []
    for fpath, content in files.items():
        context.append(f"# FILE: {fpath}\n{content}")
    return "\n".join(context)

# ── ASK LLM FOR PATCH WITH DESCRIPTION ───────────────
def ask_llm(snippets, report, full_context=None):
    prompt_parts = []
    for fpath, snips in snippets.items():
        for s in snips:
            prompt_parts.append(f"# FILE: {fpath}\n{s}")
    snippet_context = "\n".join(prompt_parts)

    if full_context:
        snippet_context += "\n\n# FULL PROJECT CONTEXT\n" + full_context

    prompt = f"""
You are a security engineer.

=== SCANNER FINDINGS ===
{json.dumps(report, indent=2)}

=== VULNERABLE CODE SNIPPETS ===
{snippet_context}

Fix ONLY the vulnerabilities above.
Keep structure SAME. Minimal changes only.

Return JSON like this:
{{
  "files": [
    {{
      "path": "relative/path/to/file.py",
      "content": "FULL FIXED FILE",
      "description": "Brief description of what was fixed"
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1
    )

    raw = response.choices[0].message.content
    cleaned = extract_json(raw)
    try:
        return json.loads(cleaned)
    except:
        print("[blue] LLM ERROR:\n", raw)
        return {"files": []}

# ── APPLY PATCHES ─────────────────────────────────────
def apply_patch(files):
    for f in files:
        path = os.path.join(PROJECT_ROOT, f.get("path", ""))
        if not path or not f.get("content"):
            continue
        try:
            with open(path, "w", encoding="utf-8") as file:
                file.write(f["content"])
            print(f"[blue] patched {path}")
        except Exception as e:
            print(f"[blue] failed {path}: {e}")

# ── PDF REPORT ───────────────────────────────────────
def generate_patch_report(original_files, patched_files, report):
    doc = SimpleDocTemplate(PDF_REPORT_PATH, pagesize=A4)
    styles = getSampleStyleSheet()
    code_style = ParagraphStyle('Code', parent=styles['Normal'], fontName='Courier', fontSize=8)
    elements = []

    elements.append(Paragraph("Patch Report", styles["Title"]))
    elements.append(Spacer(1, 12))
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    elements.append(Paragraph(f"Generated on: {now}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    total_files = len(patched_files)
    elements.append(Paragraph(f"<b>Total files patched:</b> {total_files}", styles["Normal"]))
    total_vulns = len(report.get("findings", []))
    elements.append(Paragraph(f"<b>Total vulnerabilities fixed:</b> {total_vulns}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    for f in patched_files:
        path = f.get("path")
        new_content = f.get("content", "")
        desc = f.get("description", "No description provided")
        old_content = original_files.get(path, "")

        elements.append(Paragraph(f"<b>File:</b> {path}", styles["Heading2"]))
        elements.append(Paragraph(f"<b>Description of fixes:</b> {desc}", styles["Normal"]))
        elements.append(Spacer(1, 6))

        old_lines = old_content.splitlines()
        new_lines = new_content.splitlines()
        diff_lines = []
        for i, (o, n) in enumerate(zip(old_lines, new_lines)):
            if o != n:
                diff_lines.append(f"- {o}\n+ {n}")
        if len(new_lines) > len(old_lines):
            for n in new_lines[len(old_lines):]:
                diff_lines.append(f"+ {n}")

        snippet = "\n".join(diff_lines[:20])
        if len(diff_lines) > 20:
            snippet += "\n... (truncated)"
        snippet = snippet.replace("<", "&lt;").replace(">", "&gt;")
        elements.append(Paragraph(f"<pre>{snippet}</pre>", code_style))
        elements.append(Spacer(1, 12))

    try:
        doc.build(elements)
        print(f"[blue] PDF report generated at {PDF_REPORT_PATH}")
    except Exception as e:
        print(f"[blue] Failed to generate PDF report: {e}")

# ── MAIN ──────────────────────────────────────────────
def run():
    print("[blue] loading report...")
    report = load_report()

    print("[blue] reading project files...")
    original_files = read_all_files()

    print("[blue] extracting vulnerable snippets...")
    snippets = get_vulnerable_snippets(original_files, report)
    if not snippets:
        print("[blue] no snippets found for patching")
        return

    print("[blue] building full context for LLM...")
    full_context = build_context(original_files)

    print("[blue] sending snippets to LLM for patching...")
    patched_files = ask_llm(snippets, report, full_context).get("files", [])

    print("[blue] applying patches...")
    apply_patch(patched_files)

    print("[blue] generating patch report...")
    generate_patch_report(original_files, patched_files, report)

    print("[blue] done.")

if __name__ == "__main__":
    run()