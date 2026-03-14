
// ==========================================
// ARGUS GLYPH SYSTEM
// Minimal, geometric, military-console style
// ==========================================

interface GlyphProps {
  className?: string;
  active?: boolean;
}

// 1. OVERVIEW: The Primary Eye
export function ArgusEye({ className = "", active = false }: GlyphProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} ${active ? "text-accent" : "text-current"}`}
      fill="none"
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" fill={active ? "currentColor" : "none"} />
      <path d="M12 21V23M12 1V3M21 12H23M1 12H3" strokeOpacity="0.5" />
    </svg>
  );
}

// 2. EXPLORER: The Grid / Field
export function ArgusGrid({ className = "", active = false }: GlyphProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} ${active ? "text-accent" : "text-current"}`}
      fill="none"
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

// 3. CONVERGENCE: The Network Node
export function ArgusNode({ className = "", active = false }: GlyphProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} ${active ? "text-accent" : "text-current"}`}
      fill="none"
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="2" strokeDasharray="2 2" />
      <path d="M8.5 16.5L15.5 8.5" />
      <path d="M9 18H15" strokeOpacity="0.5" />
    </svg>
  );
}

// 4. TRL: The Ladder / Gauge
export function ArgusLadder({ className = "", active = false }: GlyphProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} ${active ? "text-accent" : "text-current"}`}
      fill="none"
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      {/* Steps */}
      <path d="M7 20H17" />
      <path d="M7 15H17" />
      <path d="M7 10H17" />
      <path d="M7 5H17" />
      
      {/* Rails */}
      <path d="M7 4V20" />
      <path d="M17 4V20" />
    </svg>
  );
}

// 5. ALERTS: The Signal Pulse
export function ArgusSignal({ className = "", active = false }: GlyphProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} ${active ? "text-accent" : "text-current"}`}
      fill="none"
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path d="M22 12H19L16 20L8 4L5 12H2" />
      {active && <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />}
    </svg>
  );
}
