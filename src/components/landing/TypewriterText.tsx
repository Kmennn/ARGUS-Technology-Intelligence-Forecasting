"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function TypewriterText({ text, delay = 0, className = "" }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Start typing after delay
    const timeout = setTimeout(() => {
      setShowCursor(true);
      
      let currentIndex = 0;
      interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTypingComplete(true);
        }
      }, 40); // 40ms per char
      
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  // Cursor logic: Blink when finished, then fade out
  useEffect(() => {
    if (isTypingComplete) {
      const timeout = setTimeout(() => {
        setShowCursor(false);
      }, 1200); // Blink for 1.2s then fade
      return () => clearTimeout(timeout);
    }
  }, [isTypingComplete]);

  return (
    <span className={`font-mono ${className}`}>
      {displayedText}
      <span className={`inline-block w-2.5 h-[1.2em] bg-accent ml-1 align-bottom ${showCursor ? "animate-pulse" : "opacity-0 transition-opacity duration-300"}`}></span>
    </span>
  );
}
