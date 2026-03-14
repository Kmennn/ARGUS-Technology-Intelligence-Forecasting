"use client";

import React, { createContext, useContext, useState } from "react";
import { Role } from "@/lib/auth";

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Admin during development so the builder can see everything initially
  const [role, setRole] = useState<Role>("Admin");

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
      {/* Mock Identity Toggler for Prototype */}
      <div className="fixed bottom-4 right-4 z-[9999] bg-[var(--background-alt)] border border-[var(--border-strong)] p-3 font-mono text-[10px] shadow-lg flex flex-col gap-2">
        <div className="text-[var(--ink-secondary)] uppercase tracking-widest font-bold">Mock Identity</div>
        <div className="flex gap-2">
          {(["Analyst", "Allocator", "Admin"] as Role[]).map((r) => (
             <button
               key={r}
               onClick={() => setRole(r)}
               className={`px-3 py-1 border transition-colors ${role === r ? 'bg-[var(--ink-primary)] text-[var(--background)] border-[var(--ink-primary)] font-bold' : 'border-[var(--border-soft)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]'}`}
             >
               {r}
             </button>
          ))}
        </div>
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
