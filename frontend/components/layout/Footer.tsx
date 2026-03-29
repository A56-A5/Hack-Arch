export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 mt-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-extrabold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Re<span className="text-blue-400">Blue AI</span>
          </span>
          <span className="ml-3 text-xs font-mono text-gray-600">Autonomous Red Team Demo</span>
        </div>
        <p className="text-xs font-mono text-gray-600">
          AI‑driven red‑teaming · human‑in‑the‑loop remediation · educational demo
        </p>
      </div>
    </footer>
  );
}