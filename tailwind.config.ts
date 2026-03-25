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
        /* shadcn CSS variable colors */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* existing brand color palettes (preserved) */
        primary: {
          DEFAULT: "#6C5CE7",
          50: "#f0effe",
          100: "#e4e1fd",
          200: "#cdc8fb",
          300: "#b0a7f8",
          400: "#9080f3",
          500: "#6C5CE7",
          600: "#5a45dc",
          700: "#4c35c8",
          800: "#3f2ca3",
          900: "#352983",
        },
        secondary: {
          DEFAULT: "#FFB8C6",
          50: "#fff5f7",
          100: "#ffe8ee",
          200: "#ffd5e0",
          300: "#ffc2d0",
          400: "#FFB8C6",
          500: "#ff8fa8",
          600: "#ff6689",
          700: "#ff3d6b",
          800: "#e01a4a",
          900: "#b8123b",
        },
        gold: {
          DEFAULT: "#F9CA24",
          50: "#fffde8",
          100: "#fffac5",
          200: "#fff38c",
          300: "#ffe94a",
          400: "#F9CA24",
          500: "#e8b000",
          600: "#c88500",
          700: "#a05f00",
          800: "#844a00",
          900: "#6f3c00",
        },
        ivory: "#FFF8F0",
        'card-dark': '#1A0A2E',
        'card-purple': '#2D1B69',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        sans: ["Pretendard", "sans-serif"],
      },
      backgroundImage: {
        "gradient-card": "linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)",
        "gradient-primary": "linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)",
        "gradient-gold": "linear-gradient(135deg, #F9CA24 0%, #f0932b 100%)",
      },
      animation: {
        "card-flip": "cardFlip 1s ease-in-out",
        "card-float": "cardFloat 3s ease-in-out infinite",
        "confetti-fall": "confettiFall 1.5s ease-in forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        cardFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        cardFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(108, 92, 231, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(108, 92, 231, 0.9)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
