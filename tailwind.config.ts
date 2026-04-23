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

        /* ────────────────────────────────────────────────────
         * Oheng (오행) palette — extracted from card illustrations
         * 木 wood, 火 fire, 土 earth, 金 metal, 水 water
         * ──────────────────────────────────────────────────── */
        oheng: {
          wood: {
            50:  '#EFFAEC',
            100: '#D4F0C9',
            200: '#B5E3A3',
            300: '#8FD47B',
            400: '#72C05B',
            500: '#5FA64A',
            600: '#4A893A',
            700: '#3E7A2E',
            800: '#2E5E22',
            900: '#1F4118',
          },
          fire: {
            50:  '#FFF0F3',
            100: '#FFD6DD',
            200: '#FFBCC7',
            300: '#FF8FA8',
            400: '#F07289',
            500: '#E05A7A',
            600: '#C84263',
            700: '#B23350',
            800: '#8C2340',
            900: '#661830',
          },
          earth: {
            50:  '#FBF4E2',
            100: '#F4E4B8',
            200: '#ECD396',
            300: '#E0C080',
            400: '#CFA45D',
            500: '#B88B3E',
            600: '#9A702C',
            700: '#7A5820',
            800: '#5A4016',
            900: '#3E2B0E',
          },
          metal: {
            50:  '#F0F4F8',
            100: '#D8E0EA',
            200: '#BECADA',
            300: '#A5B3C4',
            400: '#8695AA',
            500: '#6C7E94',
            600: '#546579',
            700: '#445367',
            800: '#313C4C',
            900: '#1F2634',
          },
          water: {
            50:  '#EEF2FC',
            100: '#C8D4F4',
            200: '#A5B5E8',
            300: '#7E8FD4',
            400: '#6070BC',
            500: '#4A5FA8',
            600: '#384C8C',
            700: '#2D3D7A',
            800: '#1F2B58',
            900: '#121A3A',
          },
        },

        /* Card grade colors (etched from rarity badges in PDF) */
        grade: {
          n:   '#B8BCC5',
          r:   '#5E8CE8',
          sr:  '#B07DE5',
          ssr: '#F4C542',
          ur:  '#E94A6E',
          // sss uses conic-gradient, see `backgroundImage`
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "1.25rem",   // 20px — match real card frame
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        sans: ["Pretendard Variable", "Pretendard", "sans-serif"],
        display: ["Jua", "Pretendard Variable", "sans-serif"],
        handwrite: ["Gaegu", "Pretendard Variable", "sans-serif"],
      },
      backgroundImage: {
        "gradient-card": "linear-gradient(135deg, #1A0A2E 0%, #2D1B69 100%)",
        "gradient-primary": "linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)",
        "gradient-gold": "linear-gradient(135deg, #F9CA24 0%, #f0932b 100%)",
        // Oheng gradients (for card-like backgrounds)
        "oheng-wood": "linear-gradient(135deg, #EFFAEC 0%, #B5E3A3 100%)",
        "oheng-fire": "linear-gradient(135deg, #FFF0F3 0%, #FFBCC7 100%)",
        "oheng-earth": "linear-gradient(135deg, #FBF4E2 0%, #ECD396 100%)",
        "oheng-metal": "linear-gradient(135deg, #F0F4F8 0%, #BECADA 100%)",
        "oheng-water": "linear-gradient(135deg, #EEF2FC 0%, #A5B5E8 100%)",
        // SSS mythology holographic
        "grade-sss": "conic-gradient(from 180deg at 50% 50%, #ffb8c6, #b0a7f8, #8fd47b, #f4c542, #ff8fa8, #ffb8c6)",
      },
      boxShadow: {
        // "눌리는" 게임 버튼 섀도 (stardew 스타일)
        'game-sm': '0 2px 0 rgba(0,0,0,0.08), 0 3px 0 var(--btn-shadow, rgb(108 92 231 / 0.7))',
        'game':    '0 2px 0 rgba(0,0,0,0.10), 0 4px 0 var(--btn-shadow, rgb(108 92 231 / 0.7))',
        'game-lg': '0 2px 0 rgba(0,0,0,0.10), 0 6px 0 var(--btn-shadow, rgb(108 92 231 / 0.7))',
        'game-pressed': '0 0 0 var(--btn-shadow, rgb(108 92 231 / 0.7))',
        // 소프트 파스텔
        'soft':   '0 4px 20px rgba(108, 92, 231, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
        'soft-lg':'0 10px 40px rgba(108, 92, 231, 0.12), 0 2px 6px rgba(0,0,0,0.06)',
        // 카드 등급 글로우
        'glow-r':  '0 0 15px rgba(94,140,232,0.35)',
        'glow-sr': '0 0 20px rgba(176,125,229,0.45)',
        'glow-ssr':'0 0 25px rgba(244,197,66,0.55)',
        'glow-ur': '0 0 30px rgba(233,74,110,0.60)',
        'glow-sss':'0 0 40px rgba(236,72,153,0.70)',
      },
      animation: {
        "card-flip": "cardFlip 1s ease-in-out",
        "card-float": "cardFloat 3s ease-in-out infinite",
        "confetti-fall": "confettiFall 1.5s ease-in forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        // 신규 cozy-game motions
        "spring-pop": "springPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "bounce-soft": "bounceSoft 1.8s ease-in-out infinite",
        "wiggle": "wiggle 0.6s ease-in-out infinite",
        "sparkle": "sparkle 1.4s ease-in-out infinite",
        "float-up": "floatUp 3s ease-out infinite",
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
        springPop: {
          "0%":   { transform: "scale(0.6)", opacity: "0" },
          "60%":  { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%":      { transform: "rotate(2deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0.6)" },
          "50%":      { opacity: "1", transform: "scale(1)" },
        },
        floatUp: {
          "0%":   { transform: "translateY(0) scale(1)", opacity: "0" },
          "20%":  { opacity: "1" },
          "100%": { transform: "translateY(-40px) scale(0.6)", opacity: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
