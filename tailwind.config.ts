import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fondo: "#070b16",
        panel: "#0f1626",
        borde: "#1e293b",
        marca: {
          DEFAULT: "#fbbf24", // amarillo Venezuela
          dark: "#f59e0b",
          azul: "#3b82f6",
          rojo: "#ef4444",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(251,191,36,0.25), 0 8px 30px rgba(251,191,36,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
