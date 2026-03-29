"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#090b10]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs font-mono font-bold">R</span>
          <span className="font-extrabold text-white tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            Re<span className="text-blue-400">Blue AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="pulse-dot w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-xs font-mono text-gray-500">LIVE DEMO</span>
          </div>
          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-gray-400 transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-gray-400 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-gray-400 transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#090b10] px-4 py-4 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 px-4 pt-3 mt-1 border-t border-white/[0.05]">
            <span className="pulse-dot w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span className="text-xs font-mono text-gray-500">LIVE DEMO</span>
          </div>
        </div>
      )}
    </header>
  );
}