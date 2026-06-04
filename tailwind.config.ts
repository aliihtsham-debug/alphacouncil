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
        // ─── Base ──────────────────────────
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // ─── Primary (Neon Cyan) ──────────
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },

        // ─── Secondary (Neon Purple) ───────
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        // ─── Accent (Neon Green) ──────────
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        // ─── Destructive (Neon Red) ────────
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        // ─── Card ──────────────────────────
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        // ─── Popover ───────────────────────
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // ─── Chart colors ──────────────────
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },

        // ─── Sidebar ───────────────────────
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
        },
      },

      // ─── Border Radius ─────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ─── Fonts ─────────────────────────
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      // ─── Keyframes ─────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },

      // ─── Animations ────────────────────
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },

      // ─── Background Images ─────────────
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
      },

      // ─── Box Shadows ───────────────────
      boxShadow: {
        glow: "0 0 20px rgba(6, 182, 212, 0.3)",
        "glow-lg": "0 0 40px rgba(6, 182, 212, 0.4)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.3)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.3)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.3)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },

      // ─── Backdrop Blur ─────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
