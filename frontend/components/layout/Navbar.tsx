import { roadmapItems } from "@/lib/demoData";

const sections = [
  {
    key: "technical" as const,
    label: "⚙️ Technical Scalability",
    gradient: "from-slate-900 to-slate-800",
    accent: "text-blue-400",
    border: "border-blue-900/30",
  },
  {
    key: "features" as const,
    label: "🚀 Feature Scalability",
    gradient: "from-red-950/40 to-slate-900",
    accent: "text-red-400",
    border: "border-red-900/30",
  },
  {
    key: "business" as const,
    label: "📈 Business Scaling",
    gradient: "from-purple-950/30 to-slate-900",
    accent: "text-purple-400",
    border: "border-purple-900/30",
  },
];

const agentFlow = [
  { label: "Red Agent\n(LLM)", sub: "Observes app\nPlans attack\nExecutes", color: "bg-red-900/40 border-red-700/50 text-red-300" },
  { label: "→", sub: "", color: "text-gray-600 text-2xl" },
  { label: "Vulnerability\nReport", sub: "Endpoint · Payload\nSeverity · Reasoning", color: "bg-orange-900/30 border-orange-700/40 text-orange-300" },
  { label: "→", sub: "", color: "text-gray-600 text-2xl" },
  { label: "Blue Logic\n(Fix Maps)", sub: "Reads report\nMaps templates", color: "bg-blue-900/40 border-blue-700/50 text-blue-300" },
  { label: "→", sub: "", color: "text-gray-600 text-2xl" },
  { label: "User Approval", sub: "Applies patch\nAuthority gate", color: "bg-purple-900/40 border-purple-700/40 text-purple-300" },
  { label: "→", sub: "", color: "text-gray-600 text-2xl" },
  { label: "Re‑run Red\n(Verify)", sub: "Confirms exploit\nfailed post-patch", color: "bg-green-900/40 border-green-700/40 text-green-300" },
];

export default function FutureScalingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <div className="badge-blue mb-4">🗺️ ROADMAP</div>
        <h1 className="section-title text-white mb-2">Future‑Scaling Roadmap</h1>
        <p className="text-gray-500 text-sm">From demo to AI‑driven AppSec platform.</p>
      </div>

      {/* Agent Architecture */}
      <div className="glass-card p-6 mb-10">
        <h2 className="font-bold text-white mb-6 text-lg">AI-Agent Architecture</h2>
        <div className="flex items-center flex-wrap gap-2">
          {agentFlow.map((node, i) => (
            node.label === "→" ? (
              <span key={i} className="text-gray-600 text-xl font-mono">→</span>
            ) : (
              <div
                key={i}
                className={`px-4 py-3 rounded-xl border text-center min-w-[100px] ${node.color}`}
              >
                <div className="text-xs font-bold font-mono whitespace-pre-line leading-tight">{node.label}</div>
                {node.sub && (
                  <div className="text-[10px] opacity-60 mt-1 whitespace-pre-line leading-tight">{node.sub}</div>
                )}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Roadmap sections */}
      <div className="space-y-10">
        {sections.map((sec) => (
          <div key={sec.key}>
            <h2 className={`font-bold mb-4 text-lg ${sec.accent}`}>{sec.label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmapItems[sec.key].map((item) => (
                <div
                  key={item.title}
                  className={`glass-card p-5 hover:border-white/15 transition-all duration-300 ${sec.border}`}
                >
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vision strip */}
      <div className="mt-12 glass-card p-8 text-center border-indigo-900/30">
        <h3 className="text-2xl font-extrabold text-white mb-3">
          The Vision: Autonomous AppSec in Every Pipeline
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
          Every commit triggers Red. Every vulnerability surfaces a Fix. Every patch is verified. 
          Security becomes continuous, automated, and human-supervised — not a one-time audit.
        </p>
      </div>
    </div>
  );
}