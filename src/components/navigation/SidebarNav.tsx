"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Role } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  requiredRole?: Role;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "COMMAND",
    items: [
      { href: "/overview", label: "Overview" },
      { href: "/command", label: "Command" },
      { href: "/decisions", label: "Decisions", requiredRole: "Allocator" },
      { href: "/calibration", label: "Calibration", requiredRole: "Admin" },
    ],
  },
  {
    title: "FORECASTING & SIGNALS",
    items: [
      { href: "/intelligence", label: "Intelligence" },
      { href: "/signals", label: "Signals" },
      { href: "/emergence", label: "Emergence" },
      { href: "/trajectory", label: "Trajectories" },
    ],
  },
  {
    title: "CAPABILITY & IMPACT",
    items: [
      { href: "/simulation", label: "Simulation", requiredRole: "Allocator" },
      { href: "/assessment", label: "Assessment" },
      { href: "/capabilities", label: "Capabilities" },
      { href: "/trl", label: "TRL" },
    ],
  },
  {
    title: "INSTITUTIONAL CORPUS",
    items: [
      { href: "/research", label: "Research" },
      { href: "/analysis", label: "Analysis" },
      { href: "/corpus", label: "Corpus" },
      { href: "/archive", label: "Archive" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navContent = (
    <div className="flex flex-col h-full py-8 px-6 overflow-y-auto bg-[var(--background)] border-r border-[var(--border-soft)]">
      {/* Brand - visible on mobile as back-to-home */}
      <div className="mb-10 lg:hidden">
        <Link 
          href="/" 
          className="font-serif text-2xl tracking-widest text-[var(--ink-primary)]"
        >
          ARGUS
        </Link>
      </div>

      {sections.map((section, sIdx) => (
        <div key={section.title} className={sIdx === 0 ? "" : "mt-10"}>
          <h3 className="font-serif text-[10px] tracking-[0.2em] uppercase text-[var(--ink-tertiary)] mb-5">
            {section.title}
          </h3>
          <ul className="space-y-4">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="flex items-center group">
                  <Link
                    href={item.href}
                    className={`
                      text-[14px] transition-all duration-200 flex items-center gap-3
                      ${isActive 
                        ? "font-semibold text-[var(--ink-primary)]" 
                        : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]"
                      }
                    `}
                  >
                    {item.label}
                    {item.requiredRole && (
                      <span className="text-[9px] tracking-widest uppercase text-[var(--ink-muted)] font-mono ml-1">
                        {item.requiredRole}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      
      {/* Spacer */}
      <div className="mt-auto pt-16">
        <div className="text-[10px] font-mono text-[var(--ink-muted)] uppercase tracking-widest opacity-50">
          v1.2 // Strategic Ops
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] p-3 rounded-full bg-[var(--ink-primary)] text-[var(--background)] shadow-lg lg:hidden"
        aria-label="Toggle navigation"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        )}
      </button>

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:block w-[280px] h-screen fixed left-0 top-0 z-40">
        {navContent}
      </aside>

      {/* Mobile Overlay Sidebar */}
      <div 
        className={`
          fixed inset-0 z-50 lg:hidden transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="w-[85vw] max-w-[320px] h-full shadow-2xl">
          {navContent}
        </div>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
}
