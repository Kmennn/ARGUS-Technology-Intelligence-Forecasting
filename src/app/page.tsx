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
  const [activeTab, setActiveTab] = useState(0);

  const capabilities = [
    { id: 0, title: "Signal Telemetry", desc: "Continuous ingestion of global research, patents, and technical vectors, mathematically weighted and bound to temporal horizons." },
    { id: 1, title: "Horizon Engine", desc: "Deterministic mathematical modeling of technology maturity, forecasting critical convergence points before they emerge." },
    { id: 2, title: "Monte Carlo", desc: "Probabilistic simulation engine mapping cascading dependencies across domains, revealing institutional blind spots." },
    { id: 3, title: "Governance", desc: "Immutable cryptographic ledgers tracing every analytical mutation and strategic decision back to its source evidence." }
  ];

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

      {/* 1. Mission Statement Section */}
      <section className="relative argus-section--primary overflow-hidden mai-section-padding">
        <div className="mai-blob-container">
          <div className="mai-blob mai-blob-1"></div>
          <div className="mai-blob mai-blob-2"></div>
        </div>
        <div className="mai-grid-asymmetric max-w-[1400px] mx-auto relative z-10 reveal-on-scroll">
          <div>
            <h2 className="mai-headline mb-10">We build technology intelligence frameworks.</h2>
            <button
              onClick={() => router.push("/overview")}
              className="mai-pill-btn mt-6"
            >
              Explore our research archive <span className="opacity-70">→</span>
            </button>
          </div>
          <div className="pt-4">
            <p className="mai-body text-[var(--ink-secondary)] max-w-[40ch]">
              Through mathematically grounded forecasting and structured evidentiary pipelines, we transform fragmented global signals into institutional foresight and decision superiority.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Latest Intelligence Grid */}
      <section className="argus-section--primary mai-section-padding pt-0">
        <div className="max-w-[1400px] mx-auto reveal-on-scroll">
          <div className="mb-16 flex justify-between items-end border-b border-[rgba(0,0,0,0.05)] pb-8">
            <div>
              <h2 className="mai-subheadline mb-2" style={{ fontStyle: "normal", color: "var(--ink-primary)" }}>Latest intelligence.</h2>
              <span className="mai-subheadline" style={{ fontSize: "clamp(20px, 2vw, 32px)" }}>Signals. Patterns. Forecasts.</span>
            </div>
            <button onClick={() => router.push("/evidence")} className="mai-pill-btn hidden sm:flex">
              All intelligence <span className="opacity-70">→</span>
            </button>
          </div>

          <div className="mai-grid-asymmetric">
            {/* Feature Card */}
            <div className="mai-card group cursor-pointer" onClick={() => router.push("/research")}>
              <div className="mai-card-image-wrapper">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgba(198,104,75,0.4)] to-[rgba(138,126,119,0.3)] opacity-60 transition-opacity group-hover:opacity-80 mix-blend-multiply"></div>
                <div className="absolute bottom-6 left-6 flex gap-3">
                  <span className="mai-tag shadow-sm">research</span>
                  <span className="mai-tag shadow-sm">forecast</span>
                </div>
              </div>
              <div className="mai-card-content">
                <span className="mai-meta-text mb-4 block">Mar 12, 2026 · 14 min read</span>
                <h3 className="font-serif text-[clamp(28px,3vw,40px)] leading-[1.1] text-[var(--ink-primary)] font-light mb-4">
                  The Convergence of Quantum Error Correction and Lattice Cryptography
                </h3>
                <p className="mai-body line-clamp-2">Our latest horizon models indicate a 24-month acceleration in timeline compression, driven by recent heuristic breakthroughs.</p>
              </div>
            </div>

            {/* Sub Cards List */}
            <div className="flex flex-col gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="mai-card group flex flex-col sm:flex-row cursor-pointer h-full" onClick={() => router.push("/research")}>
                  <div className="w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto bg-gradient-to-br from-[rgba(138,126,119,0.2)] to-[rgba(198,104,75,0.1)] relative"></div>
                  <div className="mai-card-content flex-1 p-6 flex flex-col justify-center">
                    <span className="mai-meta-text mb-3 block">Mar 08, 2026</span>
                    <h3 className="font-serif text-2xl leading-[1.2] text-[var(--ink-primary)] font-light mb-3">
                      {i === 1 ? "Supply Chain Vulnerabilities in Advanced Packaging" : "Emergent Behavior in Billion-Parameter Models"}
                    </h3>
                  </div>
                </div>
              ))}
              <button onClick={() => router.push("/evidence")} className="mai-pill-btn mt-4 justify-center sm:hidden">
                All intelligence <span className="opacity-70">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Founder's Quote */}
      <section className="relative argus-section--secondary mai-section-padding overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[rgba(255,255,255,0.5)] to-transparent pointer-events-none"></div>
        <div className="mai-grid-asymmetric max-w-[1400px] mx-auto reveal-on-scroll relative z-10 items-center">
          <blockquote className="m-0 pr-8 md:pr-16 lg:pr-24">
            <h2 className="font-serif text-[clamp(28px,4vw,56px)] leading-[1.25] text-[#2f2a26] font-light mb-8 max-w-[24ch]">
              “A nation is not merely defined by the lines on a map, but by the vigor of its energy, the robustness of its economy, and the strength of its defense.”
            </h2>
          </blockquote>
          
          <div className="flex flex-col items-start justify-center pl-8 md:pl-12 border-l border-[rgba(0,0,0,0.05)] h-full min-h-[250px] mt-10 md:mt-0">
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/assets/signature.png" 
                alt="Virendra Mahajan Signature" 
                className="h-24 md:h-32 w-auto object-contain opacity-75 mix-blend-multiply grayscale brightness-110 contrast-125" 
              />
            </div>
            
            <p className="font-mono text-xs md:text-sm tracking-widest text-[#5e554d] uppercase mt-2">
              Virendra Mahajan, Chief Architect & Founder
            </p>
          </div>
        </div>
      </section>

      {/* 4. Core Capabilities (Pill Tabs) */}
      <section className="argus-section--primary mai-section-padding text-center">
        <div className="max-w-[1000px] mx-auto reveal-on-scroll">
          <h2 className="mai-headline mb-6">Core capabilities.</h2>
          <p className="mai-body mb-16 max-w-[60ch] mx-auto">
            Our platform operationalizes intelligence through four sequential modules, ensuring decisions are grounded in verifiable, forward-looking mathematical rigor.
          </p>

          {/* Interactive Tab Bar */}
          <div className="mai-tab-bar flex-wrap justify-center mb-12 shadow-sm border border-black/5">
            {capabilities.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`mai-tab font-serif text-lg ${activeTab === idx ? "active" : ""}`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Active Tab Content Card */}
          <div className="mai-card p-12 md:p-24 text-center bg-gradient-to-b from-white to-[rgba(255,255,255,0.5)] border border-black/5 min-h-[400px] flex flex-col justify-center items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(198,104,75,0.03)] to-[rgba(138,126,119,0.03)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <p className="font-mono text-sm tracking-[0.2em] text-[var(--ink-tertiary)] uppercase mb-8 relative z-10 transition-all duration-300">Phase 0{activeTab + 1}</p>
            <h3 className="font-serif text-[42px] md:text-[60px] text-[var(--ink-primary)] font-light leading-tight max-w-[20ch] mb-8 relative z-10">
              {capabilities[activeTab].title}
            </h3>
            <p className="text-[var(--ink-secondary)] text-xl md:text-2xl max-w-[50ch] mx-auto font-light leading-relaxed relative z-10">
              {capabilities[activeTab].desc}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Careers/CTA Hero (Enter Archive) */}
      <section className="argus-section--primary pb-0 px-4 sm:px-12 reveal-on-scroll">
        <div className="mai-card aspect-[21/9] min-h-[400px] relative overflow-hidden flex flex-col items-center justify-center text-center px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[#dfe6e9] to-[#dcdde1] mix-blend-multiply opacity-50"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          
          <div className="relative z-10 max-w-[800px] mx-auto">
            <h2 className="mai-headline mb-8 text-[clamp(40px,7vw,90px)]">Enter the archive.</h2>
            <p className="mai-body mb-10 max-w-[50ch] mx-auto text-[#4a4a4a]">
              Join the analysts and strategic allocators using ARGUS to navigate the horizon. Access global patterns today.
            </p>
            <button
              onClick={() => router.push("/overview")}
              className="mai-pill-btn bg-white/80 hover:bg-white text-[var(--ink-primary)] shadow-sm font-semibold"
              style={{ padding: "16px 36px", fontSize: "12px" }}
            >
              Initialize Console <span className="opacity-70 ml-2">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Premium Footer */}
      <footer className="mai-footer relative z-10 mt-12 sm:mt-24">
        <div className="mai-footer-grid pb-20 border-b border-[rgba(0,0,0,0.08)]">
          <div>
            <span className="font-serif text-3xl tracking-tight text-[var(--ink-primary)] mb-8 block">ARGUS</span>
            <p className="text-sm text-[var(--ink-secondary)] max-w-[250px] leading-relaxed">
              Institutional intelligence & horizon forecasting. Engineered for decision superiority.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-[var(--ink-tertiary)] mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-[var(--ink-secondary)]">
              <li><a href="/research" className="hover:text-[var(--ink-primary)] transition-colors">Research Archive</a></li>
              <li><a href="/signals" className="hover:text-[var(--ink-primary)] transition-colors">Global Signals</a></li>
              <li><a href="/evidence" className="hover:text-[var(--ink-primary)] transition-colors">Forecasting Engine</a></li>
              <li><a href="/calibrate" className="hover:text-[var(--ink-primary)] transition-colors">Model Calibration</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-[var(--ink-tertiary)] mb-6">Documentation</h4>
            <ul className="space-y-4 text-sm text-[var(--ink-secondary)]">
              <li><span className="cursor-help hover:text-[var(--ink-primary)] transition-colors">Methodology</span></li>
              <li><span className="cursor-help hover:text-[var(--ink-primary)] transition-colors">Data Privacy</span></li>
              <li><span className="cursor-help hover:text-[var(--ink-primary)] transition-colors">API Reference</span></li>
              <li><span className="cursor-help hover:text-[var(--ink-primary)] transition-colors">Institutional Access</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-[var(--ink-tertiary)] font-mono uppercase tracking-wider">
          <p>© {new Date().getFullYear()} ARGUS Intelligence Corporation</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <span className="hover:text-[var(--ink-primary)] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[var(--ink-primary)] cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </>
  );
}
