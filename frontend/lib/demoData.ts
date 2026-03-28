export const redReport = [
  {
    id: 1,
    vulnerability: "SQL Injection",
    endpoint: "/login",
    severity: "High",
    payload: "' OR 1=1 --",
    result: "Authentication bypassed; admin session obtained",
    reasoning:
      "LLM detected weak input validation and user enumeration pattern on /login, suggesting SQLi payload.",
    status: "pre-fix",
  },
  {
    id: 2,
    vulnerability: "Open Admin Panel",
    endpoint: "/admin",
    severity: "Medium",
    payload: "Direct navigation",
    result: "Accessed without authentication",
    reasoning:
      "No login redirect or auth middleware detected on /admin route.",
    status: "pre-fix",
  },
];

export const blueSuggestions = [
  {
    id: 1,
    for_vuln: "SQL Injection",
    fix: "Use parameterized queries or ORM input sanitization for /login",
    impact: "Prevents query‑string injection; no performance impact",
    status: "pending",
  },
  {
    id: 2,
    for_vuln: "Open Admin Panel",
    fix: "Add auth middleware and 401/redirect for unauthenticated /admin requests",
    impact: "Protects admin area; adds minimal overhead",
    status: "pending",
  },
];

export const logs = [
  { time: "00:00", step: "demo", message: "Starting autonomous red‑teaming demo" },
  { time: "00:05", step: "attack", message: "Scanning endpoints: /login, /admin ..." },
  { time: "00:10", step: "attack", message: "Executing SQLi payload on /login ... success" },
  { time: "00:15", step: "attack", message: "Detected open /admin panel; no auth" },
  { time: "00:20", step: "report", message: "Red Agent generated vulnerability report" },
  { time: "00:25", step: "blue", message: "Blue logic mapped issues to fix templates" },
  { time: "00:30", step: "user", message: "User approved SQLi and admin panel fixes" },
  { time: "00:35", step: "apply", message: "Simulating patch on /login and /admin ..." },
  { time: "00:40", step: "retest", message: "Re‑running Red Agent on patched endpoints ..." },
  { time: "00:45", step: "secured", message: "Exploits failed. System secured." },
];

export const roadmapItems = {
  technical: [
    { title: "Parallel Targets", desc: "Run red-team scans across multiple apps simultaneously" },
    { title: "Plugin Support", desc: "REST APIs, LLM agents, web apps — one interface" },
    { title: "Stateful Job Tracking", desc: "Persistent DB-backed scan history & diffing" },
  ],
  features: [
    { title: "More Attack Types", desc: "XSS, CSRF, IDOR, SSRF, and beyond" },
    { title: "Auto-Apply Fixes", desc: "One-click code patching via Git PR integration" },
    { title: "Risk Prioritization", desc: "CVSS-based triage and fix ordering" },
  ],
  business: [
    { title: "Phase 1 — Demo", desc: "Educational & hackathon proof-of-concept" },
    { title: "Phase 2 — CI/CD Plugin", desc: "Integrate directly into pipelines" },
    { title: "Phase 3 — SaaS Platform", desc: "Multi-tenant enterprise security platform" },
  ],
};