"use client";
import { useState, useEffect, useRef } from "react";
import { logs } from "@/lib/demoData";
import Link from "next/link";

const stepMeta: Record<string, { icon: string; color: string; label: string }> = {
  demo:    { icon: "🤖", color: "text-gray-400",   label: "SYSTEM" },
  attack:  { icon: "⚡", color: "text-red-400",    label: "ATTACK" },
  report:  { icon: "📋", color: "text-orange-400", label: "REPORT" },
  blue:    { icon: "🛡️", color: "text-blue-400",   label: "BLUE" },
  user:    { icon: "👤", color: "text-purple-400",  label: "USER" },
  apply:   { icon: "🔧", color: "text-yellow-400", label: "APPLY" },
  retest:  { icon: "🔁", color: "text-orange-400", label: "RETEST" },
  secured: { icon: "✅", color: "text-green-400",  label: "SECURED" },
};

export default function LogsPage() {
  const [visible, setVisible] = useState(logs.length);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    setVisible(0);
    setPlaying(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setVisible(i);
      if (i >= logs.length) {
        clearInterval(intervalRef.current!);
        setPlaying(false);
      }
    }, 600);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisible(logs.length);
    setPlaying(false);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="badge-green mb-4">📡 LIVE FEED</div>
          <h1 className="section-title text-white mb-2">Attack & Remediation Timeline</h1>
          <p className="text-gray-500 text-sm">Live narrative of the autonomous red‑team loop.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={startAutoPlay}
            disabled={playing}
            className="btn-red disabled:opacity-40"
          >
            {playing ? "⏳ Playing..." : "▶ Auto‑Play Demo"}
          </button>
          <button onClick={reset} className="btn-ghost text-xs">
            Reset
          </button>
          <Link href="/" className="btn-ghost text-xs">
            Back
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[52px] top-0 bottom-0 w-px bg-white/[0.05]" />

          <div className="space-y-1">
            {logs.map((log, i) => {
              const meta = stepMeta[log.step] || stepMeta.demo;
              const show = i < visible;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-4 py-3 transition-all duration-500 ${
                    show ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transform: show ? "translateX(0)" : "translateX(-10px)" }}
                >
                  {/* Time */}
                  <span className="text-xs font-mono text-gray-600 w-10 flex-shrink-0 pt-0.5">
                    {log.time}
                  </span>
                  {/* Icon bubble */}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-[#0f1318] border border-white/10 flex items-center justify-center text-sm flex-shrink-0">
                    {meta.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-mono font-bold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className={`text-sm font-mono ${meta.color}`}>{log.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {visible >= logs.length && (
        <div className="mt-6 p-4 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 font-mono text-sm text-center">
          ✅ Demo complete — all exploits blocked after patching.
        </div>
      )}
    </div>
  );
}