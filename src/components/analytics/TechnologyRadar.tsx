"use client";

export function TechnologyRadar({
  svgClassName = "",
}: {
  svgClassName?: string;
}) {
  return (
    <div className={`relative w-full aspect-square ${svgClassName}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
        {/* Radar Rings */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        
        {/* Crosshairs */}
        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        
        {/* Static Dots */}
        <circle cx="60" cy="40" r="2" fill="currentColor" opacity="0.8" />
        <circle cx="40" cy="60" r="1.5" fill="currentColor" opacity="0.6" />
        <circle cx="70" cy="70" r="1" fill="currentColor" opacity="0.4" />
        <circle cx="30" cy="30" r="2.5" fill="currentColor" opacity="0.9" />
        <circle cx="65" cy="55" r="1.5" fill="currentColor" opacity="0.7" />
        <circle cx="45" cy="35" r="1" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  );
}
