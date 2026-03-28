"use client";
import { useState } from "react";
import Link from "next/link";
import { blueSuggestions } from "@/lib/demoData";

export default function FixSuggestionsPage() {
  const [statuses, setStatuses] = useState<Record<number, "pending" | "applied">>(
    Object.fromEntries(blueSuggestions.map((s) => [s.id, "pending"]))
  );
  const [banner, setBanner] = useState(false);

  const applyFix = (id: number) => {
    setStatuses((prev) => ({ ...prev, [id]: "applied" }));
    setBanner(true);
  };
  const applyAll = () => {
    setStatuses(Object.fromEntries(blueSuggestions.map((s) => [s.id, "applied"])));
    setBanner(true);
  };
  const allApplied = Object.values(statuses).every((s) => s === "applied");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="badge-blue mb-4">🛡️ BLUE AGENT OUTPUT</div>
          <h1 className="section-title text-white mb-2">Fix Suggestions</h1>
          <p className="text-gray-500 text-sm">AI-assisted remediation recommendations.</p>
        </div>
        <button
          onClick={applyAll}
          disabled={allApplied}
          className="btn-blue disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
        >
          ✅ Apply All Fixes
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 font-mono text-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-lg flex-shrink-0">✓</span>
          <span className="flex-1">
            {allApplied
              ? "All patches applied. Ready to re-run Red and validate."
              : "Patch applied. Continue or re-run Red Agent."}
          </span>
          <Link href="/logs" className="underline underline-offset-4 text-green-500 hover:text-green-300 text-xs whitespace-nowrap">
            View logs →
          </Link>
        </div>
      )}

      {/* Fix cards */}
      <div className="space-y-4">
        {blueSuggestions.map((item) => {
          const isApplied = statuses[item.id] === "applied";
          return (
            <div
              key={item.id}
              className={`glass-card p-4 sm:p-6 transition-all duration-300 ${
                isApplied ? "border-green-900/30" : "hover:border-blue-900/30"
              }`}
            >
              {/* Status + label */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={isApplied ? "badge-green" : "badge-blue"}>
                  {isApplied ? "✓ Applied" : "● Pending"}
                </span>
                <span className="text-sm font-mono text-red-400">Fixes: {item.for_vuln}</span>
              </div>

              {/* Fix description */}
              <div className="p-3 sm:p-4 rounded-xl bg-blue-950/20 border border-blue-900/20 mb-3">
                <div className="text-xs font-mono text-blue-500 mb-2">RECOMMENDED FIX</div>
                <p className="text-gray-200 text-sm leading-relaxed">{item.fix}</p>
              </div>

              {/* Impact */}
              <div className="flex items-start gap-2 text-xs text-gray-500 font-mono mb-4">
                <span className="text-yellow-500 flex-shrink-0">⚠</span>
                <span>Impact: {item.impact}</span>
              </div>

              {/* Button */}
              <button
                onClick={() => applyFix(item.id)}
                disabled={isApplied}
                className={isApplied
                  ? "w-full sm:w-auto px-5 py-2.5 rounded-xl bg-green-900/40 text-green-400 border border-green-900/50 font-semibold text-sm cursor-default text-center"
                  : "btn-blue sm:w-auto"
                }
              >
                {isApplied ? "✓ Applied" : "Apply Fix"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Post-apply CTA */}
      {allApplied && (
        <div className="mt-8 glass-card p-5 sm:p-6 border-green-900/30 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-white mb-1">All fixes applied — ready to validate</h3>
            <p className="text-sm text-gray-500">Re-run Red Agent to confirm exploits are blocked.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/logs" className="btn-ghost sm:w-auto">View Logs</Link>
            <Link href="/red-report" className="btn-red sm:w-auto">Re-run Red →</Link>
          </div>
        </div>
      )}
    </div>
  );
}