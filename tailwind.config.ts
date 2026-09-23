import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: {
          DEFAULT: "#0D0D0D",
          card: "#141414",
          hover: "#1F1F1F",
          border: "#2A1A1D",
          glass: "rgba(20, 20, 20, 0.85)",
        },
        forge: {
          DEFAULT: "#FF2A4D", // Intense Crimson Red
          hover: "#E01E3E",
          muted: "rgba(255, 42, 77, 0.15)",
          glow: "rgba(255, 42, 77, 0.4)",
          text: "#FFFFFF",
        },
        crimson: {
          light: "#FFA0AE",
          DEFAULT: "#FF3B5C",
          dark: "#9E001C",
        },
        ember: {
          DEFAULT: "#FF5238",
          glow: "rgba(255, 82, 56, 0.4)",
        },
        txt: {
          primary: "#FFFFFF",
          secondary: "#A3A3A3",
          muted: "#666666",
        },
        status: {
          warning: "#FF9800",
          error: "#FF2A4D",
          info: "#38BDF8",
          success: "#FF2A4D",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(255, 42, 77, 0.45)",
        "glow-lg": "0 0 45px -5px rgba(255, 42, 77, 0.65)",
        "glow-card": "0 8px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 42, 77, 0.08)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
        flamePulse: "flamePulse 2s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.03)" },
        },
        flamePulse: {
          "0%, 100%": { filter: "drop-shadow(0 0 8px rgba(255, 42, 77, 0.8))" },
          "50%": { filter: "drop-shadow(0 0 16px rgba(255, 42, 77, 1))" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
