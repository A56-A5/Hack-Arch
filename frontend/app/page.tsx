import Link from "next/link";

const features = [
  {
    icon: "⚡",
    title: "Autonomous Red Agent",
    desc: "LLM-powered attacker that plans, executes, and reasons about vulnerabilities with no human input.",
    color: "red",
  },
  {
    icon: "📋",
    title: "Vulnerability Report",
    desc: "Structured evidence of every exploit: endpoint, payload, severity, and LLM reasoning chain.",
    color: "red",
  },
  {
    icon: "🛡️",
    title: "Blue Fix Suggestions",
    desc: "Automated remediation recommendations mapped precisely to each discovered vulnerability.",
    color: "blue",
  },
  {
    icon: "✅",
    title: "Human-in-the-Loop",
    desc: "You approve every fix before it's applied — then Red re-runs to verify the patch held.",
    color: "green",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="scanline" />

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-48 right-0 w-[400px] h-[400px] bg-blue-900/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-red-900/50 bg-red-950/30 text-red-400 text-xs font-mono">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            AUTONOMOUS SECURITY RESEARCH DEMO
          </div>
          <h1 className="page-hero text-white mb-6">
            Autonomous<br />
            <span className="text-red-500">Red Team</span> Agent<br />
            <span className="text-blue-400">+ Assisted</span> Remediation
          </h1>
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed mb-10">
            A lightweight, AI-driven red‑teaming system with a human‑in‑the‑loop
            fix-and-retest loop. Watch a live attack, review findings, approve patches,
            and validate the fix — all in one flow.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/dashboard" className="btn-red px-7 py-3 text-base">
              Start Demo →
            </Link>
            <Link href="/red-report" className="btn-ghost px-7 py-3 text-base">
              View Red Report
            </Link>
          </div>
        </div>

        {/* Mock terminal card */}
        <div className="mt-16 glass-card p-5 max-w-2xl glow-red animate-fade-up-delay-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs font-mono text-gray-600">red_agent.py</span>
          </div>
          <div className="font-mono text-sm space-y-1.5">
            <p><span className="text-gray-600">00:05</span> <span className="text-red-400">▶</span> <span className="text-gray-300">Scanning /login, /admin ...</span></p>
            <p><span className="text-gray-600">00:10</span> <span className="text-red-400">▶</span> <span className="text-red-400">SQLi payload succeeded — auth bypassed</span></p>
            <p><span className="text-gray-600">00:15</span> <span className="text-red-400">▶</span> <span className="text-red-400">/admin accessible without credentials</span></p>
            <p><span className="text-gray-600">00:20</span> <span className="text-yellow-400">●</span> <span className="text-gray-300">Generating vulnerability report ...</span></p>
            <p><span className="text-gray-600">00:25</span> <span className="text-blue-400">▶</span> <span className="text-blue-400">Blue agent mapping fixes ...</span></p>
            <p><span className="text-gray-600">00:30</span> <span className="text-purple-400">⏸</span> <span className="text-gray-300">Awaiting user approval ...</span></p>
            <p><span className="text-gray-600">00:45</span> <span className="text-green-400">✓</span> <span className="text-green-400">All exploits failed. System secured.</span></p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="section-title text-white mb-2">How it works</h2>
        <p className="text-gray-500 mb-10">Four stages. One continuous loop.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card p-5 hover:border-white/15 transition-all duration-300 animate-fade-up-delay-${i + 1}`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-red-900/30">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Ready to explore the full flow?</h3>
            <p className="text-gray-500 text-sm">Dashboard → Red Report → Fix Suggestions → Logs → Secured</p>
          </div>
          <Link href="/dashboard" className="btn-red whitespace-nowrap">
            Open Dashboard →
          </Link>
        </div>
      </section>
    </div>
  );
}