"use client";
import { useState } from "react";
import Link from "next/link";
import { redReport } from "@/lib/demoData";

const severityBadge: Record<string, string> = {
  High: "badge-red",
  Medium: "badge-yellow",
  Low: "badge-green",
};

export default function RedReportPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="badge-red mb-4">⚡ RED AGENT OUTPUT</div>
        <h1 className="section-title text-white mb-2">Vulnerability Report</h1>
        <p className="text-gray-500 text-sm">Discovered vulnerabilities — pre-fix scan. All findings are LLM-reasoned.</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-extrabold text-red-400 font-mono">2</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">VULNERABILITIES</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-extrabold text-yellow-400 font-mono">1</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">HIGH SEVERITY</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-extrabold text-blue-400 font-mono">2</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">ENDPOINTS HIT</div>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {redReport.map((item) => (
          <div
            key={item.id}
            className="glass-card p-6 hover:border-red-900/40 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className={severityBadge[item.severity]}>
                    {item.severity} Severity
                  </span>
                  <span className="badge-red">Pre‑Fix</span>
                  <span className="font-mono text-blue-400 text-sm">{item.endpoint}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.vulnerability}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-xs font-mono text-gray-600 mb-1">PAYLOAD</div>
                    <code className="text-red-400 font-mono text-sm">{item.payload}</code>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/[0.04]">
                    <div className="text-xs font-mono text-gray-600 mb-1">RESULT</div>
                    <p className="text-gray-300 text-sm">{item.result}</p>
                  </div>
                </div>

                {expanded === item.id && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-950/20 border border-blue-900/30">
                    <div className="text-xs font-mono text-blue-500 mb-2">🤖 LLM REASONING</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.reasoning}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="btn-ghost text-xs"
                >
                  {expanded === item.id ? "Hide Reasoning ↑" : "View Reasoning ↓"}
                </button>
                <Link href="/fix-suggestions" className="btn-blue text-xs">
                  View Fix →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Link href="/fix-suggestions" className="btn-blue px-8">
          Proceed to Fix Suggestions →
        </Link>
      </div>
    </div>
  );
}