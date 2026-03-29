"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRedReport, RedReport } from "@/lib/api";

const severityBadge: Record<string, string> = {
  High: "badge-red",
  CRITICAL: "badge-red",
  MEDIUM: "badge-yellow",
  LOW: "badge-green",
};

export default function RedReportPage() {
  const [report, setReport] = useState<RedReport | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedReport()
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-gray-500">
        Loading report...
      </div>
    );
  }

  const findings = report?.findings || [];
  const highCount = findings.filter(f => f.severity === "HIGH" || f.severity === "CRITICAL").length;
  const endpointCount = new Set(findings.map(f => f.endpoint)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="badge-red mb-4">⚡ RED AGENT OUTPUT</div>
        <h1 className="section-title text-white mb-2">Vulnerability Report</h1>
        <p className="text-gray-500 text-sm">Discovered vulnerabilities — pre-fix scan.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          { val: findings.length.toString(), label: "VULNERABILITIES", color: "text-red-400" },
          { val: highCount.toString(), label: "HIGH/CRIT SEVERITY", color: "text-yellow-400" },
          { val: endpointCount.toString(), label: "ENDPOINTS HIT", color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 sm:p-4 text-center">
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${s.color}`}>{s.val}</div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1 font-mono leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Vuln cards */}
      <div className="space-y-4">
        {findings.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500 font-mono">
            No vulnerabilities found. Run a scan from the dashboard.
          </div>
        ) : (
          findings.map((item, idx) => (
            <div key={idx} className="glass-card p-4 sm:p-6 hover:border-red-900/40 transition-all duration-300">
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={severityBadge[item.severity] || "badge-blue"}>{item.severity} Severity</span>
                <span className="badge-red">Pre‑Fix</span>
                <span className="font-mono text-blue-400 text-sm">{item.endpoint}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white mb-3">{item.type}</h3>

              {/* Payload + Result — stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-black/30 rounded-xl p-3 border border-white/[0.04]">
                  <div className="text-xs font-mono text-gray-600 mb-1">METHOD</div>
                  <code className="text-red-400 font-mono text-sm break-all">{item.method}</code>
                </div>
                <div className="bg-black/30 rounded-xl p-3 border border-white/[0.04]">
                  <div className="text-xs font-mono text-gray-600 mb-1">DESCRIPTION</div>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </div>
              </div>

              {/* Reasoning panel */}
              {expanded === idx && (
                <div className="mt-4 p-4 rounded-xl bg-blue-950/20 border border-blue-900/30">
                  <div className="text-xs font-mono text-blue-500 mb-2">🤖 DETECTION NOTES</div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Vulnerability {item.type} was detected on endpoint {item.endpoint}. 
                    This poses a {item.severity} risk to the application.
                  </p>
                </div>
              )}

              {/* Action buttons — stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="btn-ghost text-xs sm:w-auto"
                >
                  {expanded === idx ? "Hide Details ↑" : "View Details ↓"}
                </button>
                <Link href="/fix-suggestions" className="btn-blue text-xs sm:w-auto">
                  View Fix →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <Link href="/fix-suggestions" className="btn-blue sm:w-auto px-8">
          Proceed to Fix Suggestions →
        </Link>
      </div>
    </div>
  );
}