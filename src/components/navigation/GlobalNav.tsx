"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { hasPermission, Role } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  requiredRole?: Role;
}

const navItems: NavItem[] = [
  { href: "/research", label: "Research" },
  { href: "/analysis", label: "Analysis" },
  { href: "/signals", label: "Signals" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/calibration", label: "Calibration", requiredRole: "Admin" },
  { href: "/archive", label: "Archive" },
];

export function GlobalNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { role } = useAuth();

  return (
    <nav className="flex items-center justify-between w-full px-8 py-6 bg-transparent border-b border-transparent hover:border-[rgba(138,126,119,0.1)] transition-colors duration-500">
      {/* Left — Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 cursor-pointer transition-colors duration-300 hover:opacity-100 opacity-60"
          style={{ color: "var(--text-primary)" }}
        >
          {/* Search Icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-xs tracking-wide">Search</span>
        </button>

        {/* Expandable Search Input */}
        {searchOpen && (
          <input
            type="text"
            placeholder="Search archive..."
            className="ml-2 text-xs bg-transparent border-b outline-none w-[200px] py-1 transition-all duration-300 opacity-80"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            autoFocus
            onBlur={() => setSearchOpen(false)}
          />
        )}
      </div>

      {/* Center — Wordmark */}
      <div className="flex-1 flex justify-center">
        <Link
          href="/"
          className="text-sm font-medium tracking-[0.2em] uppercase opacity-90 transition-opacity hover:opacity-100"
          style={{ color: "var(--text-primary)" }}
        >
          ARGUS
        </Link>
      </div>

      {/* Right — Nav Links */}
      <div className="flex items-center gap-8 flex-1 justify-end">
        {navItems
          .filter((item) => !item.requiredRole || hasPermission(role, item.requiredRole))
          .map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                text-xs tracking-wide transition-all duration-300
                ${isActive
                  ? "opacity-100 font-medium"
                  : "opacity-60 hover:opacity-100"
                }
              `}
              style={{
                color: "var(--text-primary)"
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
