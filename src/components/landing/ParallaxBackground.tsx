"use client";

import { useEffect, useRef } from "react";

export function ParallaxBackground() {
  const layer1Ref = useRef<HTMLDivElement>(null); // Back: Radial Gradient
  const layer2Ref = useRef<HTMLDivElement>(null); // Middle: Grid
  const layer3Ref = useRef<HTMLDivElement>(null); // Front: Particles

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Micro Task 29.2: Speed Ratios
      // Layer 1 (Back): 0.2x
      // Layer 2 (Middle): 0.4x
      // Layer 3 (Front): 0.6x

      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translateY(${scrollY * 0.2}px)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translateY(${scrollY * 0.6}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#0A0319] overflow-hidden">
      {/* Layer 1: Deep Navy Radial Gradient (Back) */}
      <div 
        ref={layer1Ref} 
        className="absolute inset-0 w-full h-[120%]"
        style={{
          background: "radial-gradient(circle at 50% 30%, #1a1b4b 0%, #0A0319 60%)",
          willChange: "transform" 
        }}
      />

      {/* Layer 2: Subtle Token Grid (Middle) */}
      <div 
        ref={layer2Ref}
        className="absolute inset-0 w-full h-[120%]"
        style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
            willChange: "transform"
        }}
      />

      {/* Layer 3: Faint Floating Particles (Front) */}
      <div 
        ref={layer3Ref}
        className="absolute inset-0 w-full h-[120%]"
        style={{ willChange: "transform" }}
      >
        {/* Simple particle Simulation via CSS dots */}
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white opacity-10 rounded-full blur-[1px]"></div>
        <div className="absolute top-[50%] left-[80%] w-2 h-2 bg-white opacity-05 rounded-full blur-[2px]"></div>
        <div className="absolute top-[80%] left-[30%] w-1.5 h-1.5 bg-accent opacity-10 rounded-full blur-[1px]"></div>
        <div className="absolute top-[10%] left-[60%] w-1 h-1 bg-white opacity-05 rounded-full"></div>
      </div>
      
      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none"></div>
    </div>
  );
}
