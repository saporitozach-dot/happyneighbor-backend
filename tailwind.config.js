/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-liquid-hero",
    "bg-mesh-light",
    "bg-party-mist",
    "bg-white",
    "text-party-light",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        party: {
          DEFAULT: "#6366f1",
          light: "#818cf8",
          dark: "#4f46e5",
          vivid: "#7c3aed",
          deep: "#312e81",
          pale: "#ede9fe",
          mist: "#f5f3ff",
          glow: "#a78bfa",
        },
        ocean: {
          DEFAULT: "#0ea5e9",
          light: "#38bdf8",
          dark: "#0284c7",
        },
      },
      backgroundImage: {
        "liquid-hero":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(129,140,248,0.45), transparent), radial-gradient(ellipse 60% 50% at 100% 50%, rgba(168,85,247,0.35), transparent), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(14,165,233,0.3), transparent), linear-gradient(165deg, #0f0a1f 0%, #1e1b4b 40%, #312e81 100%)",
        "liquid-card":
          "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.06) 50%, rgba(14,165,233,0.05) 100%)",
        "mesh-light":
          "radial-gradient(at 40% 20%, rgba(99,102,241,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168,85,247,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(14,165,233,0.08) 0px, transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.35)",
        card: "0 4px 24px rgba(15, 10, 31, 0.06)",
        cardHover: "0 12px 40px rgba(99, 102, 241, 0.15)",
        soft: "0 2px 16px rgba(15, 10, 31, 0.04)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.85" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
