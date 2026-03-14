"use client";

import { useEffect, useRef, useState } from "react";

interface SemanticSectionProps {
  phase: string;
  children: React.ReactNode;
  className?: string;
  allowMotion?: boolean;
}

export function SemanticSection({ phase, children, className = "", allowMotion = true }: SemanticSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!allowMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 } // Trigger when 20% visible
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [allowMotion]);

  // Micro Task 29.1 Logic: 
  // Initial: opacity: 0, translate-y-10 (40px)
  // Reveal: opacity-100, translate-y-0
  // Transition: duration-1000 (approx 900ms), ease-out
  
  const baseClass = "transition-all duration-1000 ease-out";
  const hiddenClass = "opacity-0 translate-y-10";
  const visibleClass = "opacity-100 translate-y-0";

  return (
    <section 
      ref={ref} 
      data-phase={phase}
      className={`relative min-h-screen w-full flex flex-col justify-center items-center ${baseClass} ${isVisible ? visibleClass : hiddenClass} ${className}`}
    >
      {/* Staggered Child Reveal helper */}
      <div className={`transition-all duration-1000 delay-150 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
         {children}
      </div>
    </section>
  );
}
