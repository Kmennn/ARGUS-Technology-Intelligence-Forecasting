import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        background: {
          primary: "#0a0f1a",
          secondary: "#111827",
          tertiary: "#1a2332",
        },
        // Border and divider colors
        border: {
          DEFAULT: "#1e293b",
          muted: "#374151",
        },
        // Text colors
        text: {
          primary: "#e2e8f0",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        // Accent colors - Sentinel Blue (ARGUS identity)
        accent: {
          DEFAULT: "#3b82f6", // Blue-500
          muted: "#2563eb",   // Blue-600
          hover: "#60a5fa",   // Blue-400
          glow: "rgba(59, 130, 246, 0.15)",
        },
        // Signal colors - Alert Amber (warnings/signals only)
        signal: {
          DEFAULT: "#f59e0b",
          muted: "#d97706",
          glow: "rgba(245, 158, 11, 0.15)",
        },
        // Status colors
        status: {
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-albert)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "Consolas", "monospace"],
        space: ["var(--font-space)", "sans-serif"],
        syne: ["var(--font-syne)", "sans-serif"],
      },
      fontSize: {
        // Headings
        "heading-1": ["2rem", { lineHeight: "2.5rem", fontWeight: "600" }],
        "heading-2": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "heading-3": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "500" }],
        // Body
        body: ["0.875rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-lg": ["1rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        // Caption and labels
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        label: ["0.75rem", { lineHeight: "1rem", fontWeight: "500" }],
      },
      spacing: {
        // Custom spacing for consistent layouts
        "page-x": "2rem",
        "page-y": "1.5rem",
        sidebar: "16rem",
      },
      borderRadius: {
        panel: "0.5rem",
      },
      boxShadow: {
        panel: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
