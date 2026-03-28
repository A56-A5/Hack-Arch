"use client";
import { useState } from "react";
import Link from "next/link";

const flowSteps = [
  { id: 1, label: "Run Attack", icon: "⚡" },
  { id: 2, label: "Red Discovers", icon: "🔍" },
  { id: 3, label: "Gen Fixes", icon: "🛡️" },
  { id: 4, label: "Approve", icon: "✅" },
  { id: 5, label: "Secured", icon: "🔒" },
];

export default function DashboardPage() {
  const [step, setStep] = useState(0);
  const [secured, setSecured] = useState(false);

  const advance = () => {
    if (step < 5) {
      setStep((s) => {
        const next = s + 1;
        if (next === 5) setSecured(true);
        return next;
      });
    }
  };
  const reset = () => { setStep(0); setSecured(false); };

  const endpoints = [
    { path: "/login", preLabel: "SQL Injection vulnerable", postLabel: "SQLi blocked", preBadge: "badge-red", postBadge: "badge-green" },
    { path: "/admin", preLabel: "Admin panel exposed", postLabel: "Auth required", preBadge: "badge-red", postBadge: "badge-green" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${secured ? "bg-green-500" : "bg-red-500 pulse-dot"}`} />
          <span className={`text-xs font-mono ${secured ? "text-green-400" : "text-red-400"}`}>
            {secured ? "SYSTEM SECURED" : "UNDER ATTACK"}
          </span>
        </div>
        <h1 className="section-title text-white">Security Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Control panel for the red/blue demo loop</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left */}
        <div className="space-y-5">

          {/* Status card */}
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-bold text-white mb-4 text-base sm:text-lg">System Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05]">
                <span className="text-sm text-gray-400 font-mono">Vulnerabilities</span>
                <span className={`font-mono text-sm font-bold ${secured ? "text-green-400" : "text-red-400"}`}>
                  {secured ? "0 OPEN" : "2 OPEN"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] gap-2">
                <span className="text-sm text-gray-400 font-mono truncate">SQL Injection /login</span>
                <span className={`flex-shrink-0 ${secured ? "badge-green" : "badge-red"}`}>
                  {secured ? "✓ Patched" : "● Open"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 gap-2">
                <span className="text-sm text-gray-400 font-mono truncate">Admin Panel /admin</span>
                <span className={`flex-shrink-0 ${secured ? "badge-green" : "badge-red"}`}>
                  {secured ? "✓ Secured" : "● Exposed"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-bold text-white mb-4 text-base sm:text-lg">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={advance}
                disabled={step >= 5}
                className="btn-red disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 0 ? "▶ Start Attack Simulation" :
                 step === 1 ? "📋 Generate Red Report" :
                 step === 2 ? "🛡️ Generate Fix Suggestions" :
                 step === 3 ? "✅ Approve & Apply Fixes" :
                 step === 4 ? "🔁 Re‑run Red Agent" :
                 "🔒 System Secured"}
              </button>
              <Link href="/red-report" className="btn-ghost block">
                View Red Report →
              </Link>
              <Link href="/fix-suggestions" className="btn-blue block">
                Fix Suggestions →
              </Link>
              <button onClick={reset} className="w-full text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors py-2">
                ↺ Reset Demo
              </button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Flow stepper */}
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-bold text-white mb-6 text-base sm:text-lg">Demo Flow</h2>
            {/* Mobile: vertical stepper */}
            <div className="flex flex-col gap-3 sm:hidden">
              {flowSteps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 flex-shrink-0 transition-all duration-500 ${
                    step > i ? "bg-green-500 border-green-400 text-white" :
                    step === i ? "bg-red-500 border-red-400 text-white pulse-dot" :
                    "bg-transparent border-white/10 text-gray-600"
                  }`}>
                    {step > i ? "✓" : s.icon}
                  </div>
                  <span className={`text-sm font-mono ${step > i ? "text-green-400" : step === i ? "text-red-400" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Desktop: horizontal stepper */}
            <div className="hidden sm:flex items-center gap-0">
              {flowSteps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${
                      step > i ? "bg-green-500 border-green-400 text-white" :
                      step === i ? "bg-red-500 border-red-400 text-white pulse-dot" :
                      "bg-transparent border-white/10 text-gray-600"
                    }`}>
                      {step > i ? "✓" : s.icon}
                    </div>
                    <span className={`mt-2 text-center text-[10px] font-mono leading-tight max-w-[56px] ${step > i ? "text-green-400" : step === i ? "text-red-400" : "text-gray-600"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < flowSteps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 transition-all duration-700 ${step > i ? "bg-green-500" : "bg-white/[0.06]"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Target endpoints */}
          <div className="glass-card p-5 sm:p-6">
            <h2 className="font-bold text-white mb-4 text-base sm:text-lg">Target App Endpoints</h2>
            <div className="space-y-2">
              {endpoints.map((ep) => (
                <div key={ep.path} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0 gap-2">
                  <span className="font-mono text-sm text-blue-400 flex-shrink-0">{ep.path}</span>
                  <span className={`text-right ${secured ? ep.postBadge : ep.preBadge}`}>
                    {secured ? ep.postLabel : ep.preLabel}
                  </span>
                </div>
              ))}
            </div>
            {secured && (
              <div className="mt-4 p-3 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 text-xs font-mono">
                ✓ All endpoints hardened. Re-run confirmed: no exploits succeeded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}