"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Red Report", href: "/red-report" },
  { label: "Fix Suggestions", href: "/fix-suggestions" },
  { label: "Logs", href: "/logs" },
  { label: "Roadmap", href: "/#roadmap" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#090b10]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs font-mono font-bold">R</span>
          <span className="font-extrabold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Red<span className="text-blue-400">Blue</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="pulse-dot w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-xs font-mono text-gray-500">LIVE DEMO</span>
        </div>
      </div>
    </header>
  );
}