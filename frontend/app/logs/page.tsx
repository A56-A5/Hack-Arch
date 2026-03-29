"use client";
import { useState, useEffect } from "react";
import { getLogsStream, LogEntry } from "@/lib/api";

const stepMeta: Record<string, { icon: string; color: string; label: string }> = {
  demo:    { icon: "🤖", color: "text-gray-400",   label: "SYSTEM"  },
  attack:  { icon: "⚡", color: "text-red-400",    label: "ATTACK"  },
  report:  { icon: "📋", color: "text-orange-400", label: "REPORT"  },
  blue:    { icon: "🛡️", color: "text-blue-400",   label: "BLUE"    },
  user:    { icon: "👤", color: "text-purple-400",  label: "USER"    },
  apply:   { icon: "🔧", color: "text-yellow-400", label: "APPLY"   },
  retest:  { icon: "🔁", color: "text-orange-400", label: "RETEST"  },
  secured: { icon: "✅", color: "text-green-400",  label: "SECURED" },
};

export default function LogsPage() {
  const [logList, setLogList] = useState<LogEntry[]>([]);

  useEffect(() => {
    const stream = getLogsStream();
    
    stream.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data) as LogEntry;
        setLogList((prev) => [...prev, entry]);
      } catch (err) {
        console.error("Failed to parse log entry:", err);
      }
    };

    return () => stream.close();
  }, []);

  const reset = () => {
    setLogList([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="badge-green mb-4">📡 LIVE FEED</div>
          <h1 className="section-title text-white mb-2">Attack & Remediation Timeline</h1>
          <p className="text-gray-500 text-sm">Live narrative of the autonomous red‑team loop.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} className="btn-ghost sm:w-auto text-xs">
            ↺ Clear Local View
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-4 sm:p-6">
        <div className="relative">
          {/* Vertical line — offset for mobile */}
          <div className="absolute left-[44px] sm:left-[52px] top-0 bottom-0 w-px bg-white/[0.05]" />

          <div className="space-y-1">
            {logList.length === 0 ? (
              <div className="py-10 text-center text-gray-600 font-mono text-xs">
                Waiting for logs... Start an action on the dashboard.
              </div>
            ) : (
              logList.map((log, i) => {
                const meta = stepMeta[log.step] || stepMeta.demo;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 sm:gap-4 py-2.5 animate-fade-in"
                  >
                    {/* Timestamp */}
                    <span className="text-[10px] sm:text-xs font-mono text-gray-600 w-8 sm:w-10 flex-shrink-0 pt-1">
                      {log.time}
                    </span>
                    {/* Icon */}
                    <div className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0f1318] border border-white/10 flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                      {meta.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-mono font-bold ${meta.color} block mb-0.5`}>
                        {meta.label}
                      </span>
                      <p className={`text-xs sm:text-sm font-mono ${meta.color} break-words text-white/90`}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {logList.some(l => l.step === "secured") && (
        <div className="mt-5 p-4 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 font-mono text-xs sm:text-sm text-center">
          ✅ Demo complete — all exploits blocked after patching.
        </div>
      )}
    </div>
  );
}