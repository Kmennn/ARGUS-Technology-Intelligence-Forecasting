"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { GlobalNav } from "@/components/navigation/GlobalNav";

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    const el = heroRef.current;
    if (el) {
      el.addEventListener("mousemove", handleMouseMove);
      return () => el.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <main
      ref={heroRef}
      className="relative min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #D4956E 0%, #C8846A 25%, #D9A080 50%, #CB8B6F 75%, #D4956E 100%)",
      }}
    >
      {/* Header Bar — frosted glass over warm bg */}
      <header className="relative z-10 px-[5vw] py-4">
        <GlobalNav />
      </header>

      {/* Painterly dappled light/shadow layer (Tree shadow effect) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Base saturated warm peach/salmon */}
        <div className="absolute inset-0 bg-[#C8846A]" />

        {/* Angled container to mimic directional sunlight filtering through branches */}
        <div 
          className="absolute w-[150%] h-[150%] left-[-25%] top-[-25%]"
          style={{
            transform: `translate(${mousePos.x * 0.1 - 5}%, ${mousePos.y * 0.1 - 5}%) rotate(-35deg)`,
            transition: "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
            filter: "blur(60px)",
            mixBlendMode: "hard-light"
          }}
        >
          {/* Elongated light dapples (sunlight) */}
          <div className="absolute top-[20%] left-[20%] w-[800px] h-[200px] rounded-full bg-[rgba(255,220,190,0.5)] transform -rotate-12" />
          <div className="absolute top-[40%] left-[40%] w-[1000px] h-[250px] rounded-full bg-[rgba(255,220,190,0.4)] transform rotate-6" />
          <div className="absolute top-[60%] left-[10%] w-[600px] h-[150px] rounded-full bg-[rgba(255,220,190,0.45)] transform -rotate-6" />
          <div className="absolute top-[80%] left-[50%] w-[900px] h-[200px] rounded-full bg-[rgba(255,220,190,0.4)]" />

          {/* Elongated dark dapples (shadow from branches/leaves) */}
          <div className="absolute top-[30%] left-[10%] w-[800px] h-[180px] rounded-full bg-[rgba(140,70,50,0.6)] transform rotate-12" />
          <div className="absolute top-[50%] left-[30%] w-[700px] h-[220px] rounded-full bg-[rgba(140,70,50,0.55)] transform -rotate-6" />
          <div className="absolute top-[70%] left-[60%] w-[1100px] h-[250px] rounded-full bg-[rgba(140,70,50,0.6)] transform rotate-6" />
          <div className="absolute top-[10%] left-[60%] w-[600px] h-[150px] rounded-full bg-[rgba(140,70,50,0.5)] transform -rotate-12" />
        </div>

        {/* Ambient static bottom shadow (cool tint) for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(100,50,60,0.3) 0%, transparent 40%)",
            mixBlendMode: "multiply"
          }}
        />
        {/* Soft center spotlight that follows mouse directly but subtly */}
        <div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,230,200,0.15) 0%, transparent 60%)",
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: "translate(-50%, -50%)",
            transition: "left 0.8s ease-out, top 0.8s ease-out",
            filter: "blur(40px)",
            mixBlendMode: "screen"
          }}
        />
      </div>

      {/* Hero Content — cream text on warm background */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-[10vw]" style={{ zIndex: 1 }}>
        <div className="text-center max-w-[900px] mx-auto animate-fade-in">
          <h1
            className="text-6xl md:text-[90px] font-normal leading-tight mb-8"
            style={{ fontFamily: "var(--font-serif)", color: "rgba(254, 249, 237, 0.95)" }}
          >
            Intelligence, grounded in <i>research</i>.
          </h1>

          <p className="text-xl md:text-2xl max-w-[720px] mx-auto mb-16 leading-relaxed" style={{ color: "rgba(254, 249, 237, 0.8)" }}>
            Understanding emerging technology requires more than speed.<br/>
            It requires context, patience, and disciplined observation.
          </p>

          <div className="inline-block mt-8">
            <button
              onClick={() => router.push("/overview")}
              className="text-lg transition-colors duration-300 border-b border-transparent hover:border-white pb-1"
              style={{ color: "rgba(254, 249, 237, 0.9)" }}
            >
              Explore our research archive <span className="opacity-70 ml-2">→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
