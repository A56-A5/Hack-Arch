import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

PROJECT_ROOT = "./vul_app"
REPORT_PATH = "./vul_report.json"

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
    files = []

    for root, _, filenames in os.walk(PROJECT_ROOT):
        for f in filenames:
            if f.endswith(".py"):
                path = os.path.join(root, f)

                try:
                    with open(path, "r", encoding="utf-8") as file:
                        content = file.read()
                        files.append({
                            "path": os.path.relpath(path, PROJECT_ROOT),
                            "content": content
                        })
                except:
                    continue

    return files


# ── LOAD REPORT ───────────────────────────────────────
def load_report():
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ── FIND RELEVANT FILES BY ENDPOINT ───────────────────
def find_relevant_files(report, files):
    relevant = {}

    for finding in report["findings"]:
        endpoint = finding["endpoint"]

        for f in files:
            if endpoint in f["content"]:
                relevant[f["path"]] = f["content"]

    return relevant


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


# ── LLM FIXER ─────────────────────────────────────────
def ask_llm(report, relevant_files):
    code_context = "\n".join(
        f"# FILE: {path}\n{content}"
        for path, content in relevant_files.items()
    )

    prompt = f"""
You are a security engineer.

=== SCANNER FINDINGS ===
{json.dumps(report, indent=2)}

=== RELEVANT CODE FILES ===
{code_context}

Fix ALL vulnerabilities in the given files.

Rules:
- SQLi → parameterized queries
- Command injection → remove shell usage
- Path traversal → restrict file access
- Debug leak → remove sensitive output
- Keep structure SAME
- Only modify the given files

Return ONLY JSON:
{{
  "files": [
    {{
      "path": "relative/path/to/file.py",
      "content": "FULL FIXED FILE"
    }}
  ]
}}
Make sure you include **all files** that were provided, if they have changes.
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
        print("LLM ERROR:\n", raw)
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


# ── MAIN ──────────────────────────────────────────────
def run():
    print("[blue] loading report...")
    report = load_report()

    print("[blue] reading project files...")
    files = read_all_files()

    print("[blue] locating vulnerable files...")
    relevant_files = find_relevant_files(report, files)

    print(f"[blue] found {len(relevant_files)} relevant files")

    print("[blue] generating fixes...")
    result = ask_llm(report, relevant_files)

    print("[blue] applying patches...")
    apply_patch(result.get("files", []))

    print("[blue] done.")


if __name__ == "__main__":
    run()