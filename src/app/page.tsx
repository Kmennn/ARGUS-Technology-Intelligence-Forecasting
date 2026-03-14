"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { GlobalNav } from "@/components/navigation/GlobalNav";

// Custom hook for scroll reveal animations
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useScrollReveal();

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
    <>
      <main 
        ref={heroRef} 
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #D4956E 0%, #C8846A 25%, #D9A080 50%, #CB8B6F 75%, #D4956E 100%)",
        }}
      >
        {/* Header Bar — frosted glass over warm bg */}
        <header className="relative z-20 px-[5vw] py-4">
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
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-[10vw]">
          <div className="text-center max-w-[900px] mx-auto animate-fade-in">
            <h1
              className="text-6xl md:text-[90px] font-normal leading-tight mb-8"
              style={{ fontFamily: "var(--font-serif)", color: "rgba(254, 249, 237, 0.95)" }}
            >
              Intelligence,<br/>grounded in <i className="font-serif">research</i>.
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

      <section className="argus-section argus-section--primary overflow-hidden">
        <div className="argus-section__inner relative">
          <div className="reveal-on-scroll max-w-[800px]">
            <p className="argus-section__eyebrow">The Architecture</p>
            <h2 className="argus-section__title text-[64px] leading-[1.1] mb-8">
              Strategic foresight,<br/><strong className="font-serif">engineered.</strong>
            </h2>
            <p className="argus-section__text">
              ARGUS transforms fragmented research signals into structured intelligence models. It is not about reacting faster, but about seeing the cascade of consequences before they manifest.
            </p>
          </div>

          <div className="bento-grid mt-24 reveal-on-scroll">
            <div className="bento-card col-span-12 md:col-span-8 group">
              <h3 className="font-serif text-4xl text-[var(--ink-primary)] mb-6">Signal Telemetry</h3>
              <p className="text-[var(--ink-secondary)] text-xl font-light leading-relaxed max-w-[45ch]">
                Continuous ingestion of global research, patents, and technical vectors, mathematically weighted and bound to temporal horizons.
              </p>
            </div>
            
            <div className="bento-card col-span-12 md:col-span-4 group bg-gradient-to-br from-[rgba(255,255,255,0.4)] to-[rgba(255,255,255,0.1)]">
              <h3 className="font-serif text-4xl text-[var(--ink-primary)] mb-6">Governance</h3>
              <p className="text-[var(--ink-secondary)] text-xl font-light leading-relaxed">
                Immutable ledgers trace every analytical mutation to its source.
              </p>
            </div>

            <div className="bento-card col-span-12 group !p-20 text-center bg-gradient-to-b from-[rgba(255,255,255,0.6)] to-[rgba(255,255,255,0.2)] mt-4">
              <p className="font-mono text-xs tracking-[0.2em] text-[var(--ink-tertiary)] uppercase mb-8">Simulation Engine</p>
              <h3 className="font-serif text-[48px] md:text-[64px] text-[var(--ink-primary)] font-light mx-auto leading-tight max-w-[20ch]">
                Simulate a thousand futures to conquer one.
              </h3>
              <p className="text-[var(--ink-secondary)] text-2xl mt-8 max-w-[48ch] mx-auto font-light">
                Probabilistic Monte Carlo modeling maps cascading dependencies across domains, revealing institutional blind spots before they break.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="argus-section argus-section--quote text-center">
        <div className="argus-quote-wrap reveal-on-scroll">
          <blockquote className="argus-quote text-[48px] md:text-[80px] font-serif font-light leading-[1.05] text-[var(--ink-primary)] tracking-tight">
            “Intelligence is the space<br />
            between a signal and<br />
            its consequence.”
          </blockquote>
          <p className="argus-quote__author mt-16 tracking-[0.3em] opacity-80">ARGUS Doctrine</p>
        </div>
      </section>

      <section className="argus-section argus-section--primary pb-[200px]">
        <div className="argus-section__inner argus-section__inner--center reveal-on-scroll">
          <h2 className="argus-section__title mx-auto text-[56px] md:text-[88px] font-light">
            Enter the archive.
          </h2>
          <p className="argus-section__subtext mx-auto mt-6 text-2xl font-light">
            Access the institutional intelligence layer.
          </p>
          <button
            onClick={() => router.push("/overview")}
            className="mt-16 group relative inline-flex items-center justify-center px-10 py-5 text-sm tracking-[0.2em] uppercase font-medium overflow-hidden rounded-full border border-[var(--ink-primary)] bg-transparent transition-all duration-500 hover:bg-[var(--ink-primary)] hover:text-white"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initialize Console
            </span>
          </button>
        </div>
      </section>
    </>
  );
}
