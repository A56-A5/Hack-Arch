# red_agent.py (ZAP + smart fast fallback)

import os
import json
import time
import requests
from urllib.parse import urljoin
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

load_dotenv()

TARGET_URL = os.getenv("TARGET_URL", "http://localhost:8080")
REPORT_PATH = "./vul_report.json"
PDF_REPORT_PATH = "./red_report.pdf"

ZAP_API = "http://localhost:8090"

DEFAULT_ENDPOINTS = ["/", "/login", "/admin", "/search", "/ping", "/read", "/debug"]

COMMON_PARAMS = ["username", "password", "q", "ip", "file", "token"]

SQLI_PAYLOADS = ["' OR '1'='1"]
XSS_PAYLOADS = ["<script>alert(1)</script>"]
CMD_PAYLOADS = ["; ls"]
PATH_PAYLOADS = ["../../../../etc/passwd"]

findings_seen = set()


# ── HELPERS ───────────────────────────────
def add_finding(findings, f):
    key = (f["type"], f["endpoint"], f["method"])
    if key not in findings_seen:
        findings_seen.add(key)
        findings.append(f)


# ── ZAP SCANNER ───────────────────────────
def zap_scan():
    print("[red] trying OWASP ZAP...")
    try:
        requests.get(f"{ZAP_API}/JSON/core/view/version/", timeout=2)
    except:
        print("[red] ZAP not running")
        return []

    try:
        print("[red] ZAP spidering...")
        requests.get(f"{ZAP_API}/JSON/spider/action/scan/?url={TARGET_URL}")
        time.sleep(5)

        print("[red] ZAP active scanning...")
        requests.get(f"{ZAP_API}/JSON/ascan/action/scan/?url={TARGET_URL}")
        time.sleep(10)

        alerts = requests.get(f"{ZAP_API}/JSON/core/view/alerts/").json()

        findings = []
        for a in alerts.get("alerts", []):
            findings.append({
                "type": a.get("alert"),
                "endpoint": a.get("url"),
                "method": a.get("method"),
                "severity": a.get("risk"),
                "description": a.get("description")
            })

        print(f"[red] ZAP found {len(findings)} issues")
        return findings

    except Exception as e:
        print("[red] ZAP failed:", e)
        return []


# ── FALLBACK SCANNER ──────────────────────
def fallback_scan():
    print("[red] running smart fallback scanner...")
    findings = []

    for ep in DEFAULT_ENDPOINTS:
        full_url = urljoin(TARGET_URL, ep)
        print(f"[red] scanning {ep}")

        # ── DEBUG ENDPOINT DETECTION ──
        if "debug" in ep:
            try:
                r = requests.get(full_url, timeout=2)
                if r.status_code == 200:
                    add_finding(findings, {
                        "type": "Debug Endpoint Exposed",
                        "endpoint": ep,
                        "method": "GET",
                        "severity": "MEDIUM",
                        "description": "Debug endpoint is publicly accessible"
                    })
            except:
                pass

        # ── WEAK AUTH DETECTION ──
        if "admin" in ep:
            try:
                r = requests.get(full_url, params={"token": "1234"}, timeout=2)
                if "welcome" in r.text.lower():
                    add_finding(findings, {
                        "type": "Weak Authentication",
                        "endpoint": ep,
                        "method": "GET",
                        "severity": "HIGH",
                        "description": "Admin access granted with weak/default token"
                    })
            except:
                pass

        for param in COMMON_PARAMS:

            # ── SQLi (LOGIN BYPASS DETECTION) ──
            for payload in SQLI_PAYLOADS:
                try:
                    r = requests.post(full_url, data={param: payload}, timeout=2)
                    if "logged in" in r.text.lower():
                        add_finding(findings, {
                            "type": "SQL Injection",
                            "endpoint": ep,
                            "method": "POST",
                            "severity": "CRITICAL",
                            "description": f"Login bypass via param '{param}'"
                        })
                except:
                    pass

            # ── XSS ──
            for payload in XSS_PAYLOADS:
                try:
                    r = requests.get(full_url, params={param: payload}, timeout=2)
                    if payload in r.text:
                        add_finding(findings, {
                            "type": "XSS",
                            "endpoint": ep,
                            "method": "GET",
                            "severity": "CRITICAL",
                            "description": f"Reflected XSS via '{param}'"
                        })
                except:
                    pass

            # ── COMMAND INJECTION ──
            for payload in CMD_PAYLOADS:
                try:
                    r = requests.get(full_url, params={param: payload}, timeout=2)
                    if "uid=" in r.text.lower() or "root" in r.text.lower():
                        add_finding(findings, {
                            "type": "Command Injection",
                            "endpoint": ep,
                            "method": "GET",
                            "severity": "CRITICAL",
                            "description": f"Command execution via '{param}'"
                        })
                except:
                    pass

            # ── PATH TRAVERSAL ──
            for payload in PATH_PAYLOADS:
                try:
                    r = requests.get(full_url, params={param: payload}, timeout=2)
                    if "root:" in r.text or "[extensions]" in r.text.lower():
                        add_finding(findings, {
                            "type": "Path Traversal",
                            "endpoint": ep,
                            "method": "GET",
                            "severity": "CRITICAL",
                            "description": f"Sensitive file read via '{param}'"
                        })
                except:
                    pass

    print(f"[red] fallback found {len(findings)} issues")
    return findings


# ── SAVE JSON ─────────────────────────────
def save_json(report):
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"[red] JSON report saved → {REPORT_PATH}")


# ── PDF REPORT ────────────────────────────
def generate_pdf(report):
    doc = SimpleDocTemplate(PDF_REPORT_PATH, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Red Team Scan Report", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"<b>Target:</b> {report['target']}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Total Findings:</b> {len(report['findings'])}", styles["Normal"]))
    elements.append(Spacer(1, 12))

    for f in report["findings"]:
        elements.append(Paragraph(f"<b>{f['type']}</b>", styles["Heading3"]))
        elements.append(Paragraph(f"Endpoint: {f['endpoint']}", styles["Normal"]))
        elements.append(Paragraph(f"Method: {f['method']}", styles["Normal"]))
        elements.append(Paragraph(f"Severity: {f['severity']}", styles["Normal"]))
        elements.append(Paragraph(f"{f['description']}", styles["Normal"]))
        elements.append(Spacer(1, 12))

    doc.build(elements)
    print(f"[red] PDF report saved → {PDF_REPORT_PATH}")


# ── MAIN ───────────────────────────────────
def run():
    print("[red] starting scan...")

    findings = zap_scan()

    # fallback if zap fails or misses logic bugs
    if not findings:
        findings = fallback_scan()
    else:
        # still run lightweight logic checks
        findings += fallback_scan()

    report = {
        "target": TARGET_URL,
        "findings": findings
    }

    save_json(report)
    generate_pdf(report)

    print("[red] scan complete.")


if __name__ == "__main__":
    run()