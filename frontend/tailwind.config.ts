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
        background: "#0f0f13",
        surface: "#18181f",
        card: "#20202b",
        border: "#2d2d3d",
        primary: {
          DEFAULT: "#ff0055",
          hover: "#e6004c",
          light: "#ff3377",
        },
        secondary: {
          DEFAULT: "#7928ca",
          hover: "#661fb3",
        },
        accent: "#00dfd8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(255, 0, 85, 0.6))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 5px rgba(121, 40, 202, 0.4))" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
