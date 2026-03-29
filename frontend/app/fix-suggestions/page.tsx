"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getRedReport, startPatch, RedReport, getStatus, SystemStatus } from "@/lib/api";

export default function FixSuggestionsPage() {
  const [report, setReport] = useState<RedReport | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(false);

  const fetchData = async () => {
    try {
      const [r, s] = await Promise.all([getRedReport(), getStatus()]);
      setReport(r);
      setStatus(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = async () => {
    try {
      await startPatch();
      setBanner(true);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !report) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-gray-500">
        Loading suggestions...
      </div>
    );
  }

  const findings = report?.findings || [];
  const isPatching = status?.status === "patching";
  const isSecured = status?.status === "secured";

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
          onClick={handleApply}
          disabled={isPatching || isSecured || findings.length === 0}
          className="btn-blue disabled:opacity-40 disabled:cursor-not-allowed sm:w-auto"
        >
          {isPatching ? "🔧 Patching..." : isSecured ? "✅ All Fixed" : "✅ Apply All Fixes"}
        </button>
      </div>

      {/* Banner */}
      {(banner || isSecured) && (
        <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 font-mono text-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-lg flex-shrink-0">✓</span>
          <span className="flex-1">
            {isSecured
              ? "All patches applied. System is now secured."
              : "Patch job started. Blue agent is currently hardening the codebase."}
          </span>
          <Link href="/logs" className="underline underline-offset-4 text-green-500 hover:text-green-300 text-xs whitespace-nowrap">
            View logs →
          </Link>
        </div>
      )}

      {/* Fix cards */}
      <div className="space-y-4">
        {findings.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500 font-mono">
            No active vulnerabilities to fix. Run a scan first.
          </div>
        ) : (
          findings.map((item, idx) => (
            <div
              key={idx}
              className={`glass-card p-4 sm:p-6 transition-all duration-300 ${
                isSecured ? "border-green-900/30" : "hover:border-blue-900/30"
              }`}
            >
              {/* Status + label */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={isSecured ? "badge-green" : "badge-blue"}>
                  {isSecured ? "✓ Applied" : isPatching ? "● Patching..." : "● Pending"}
                </span>
                <span className="text-sm font-mono text-red-400">Target: {item.endpoint}</span>
              </div>

              {/* Fix description */}
              <div className="p-3 sm:p-4 rounded-xl bg-blue-950/20 border border-blue-900/20 mb-3">
                <div className="text-xs font-mono text-blue-500 mb-2">VULNERABILITY DETECTED</div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  {item.type}: {item.description}
                </p>
                <div className="mt-3 text-xs font-mono text-blue-400">
                  REMEDIATION: Blue Agent will automatically generate and apply a security patch for this finding.
                </div>
              </div>

              {/* Impact */}
              <div className="flex items-start gap-2 text-xs text-gray-500 font-mono mb-4">
                <span className="text-yellow-500 flex-shrink-0">⚠</span>
                <span>Impact: High Security Improvement</span>
              </div>

              {/* Button */}
              <button
                onClick={handleApply}
                disabled={isSecured || isPatching}
                className={isSecured
                  ? "w-full sm:w-auto px-5 py-2.5 rounded-xl bg-green-900/40 text-green-400 border border-green-900/50 font-semibold text-sm cursor-default text-center"
                  : "btn-blue sm:w-auto"
                }
              >
                {isSecured ? "✓ Applied" : isPatching ? "🔧 Patching..." : "Apply Fix"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Post-apply CTA */}
      {isSecured && (
        <div className="mt-8 glass-card p-5 sm:p-6 border-green-900/30 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-white mb-1">All fixes applied — system secured</h3>
            <p className="text-sm text-gray-500">The codebase has been hardened against the discovered exploits.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/logs" className="btn-ghost sm:w-auto">View Logs</Link>
            <Link href="/dashboard" className="btn-red sm:w-auto">Back to Dashboard</Link>
          </div>
        </div>
      )}
    </div>
  );
}