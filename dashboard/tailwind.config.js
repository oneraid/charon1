/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Charon Custom Colors
        void: "#050608",
        base: "#090c10",
        surface: "#0e1318",
        raised: "#141b22",
        overlay: "#1a2330",
        brand: {
          DEFAULT: "#00ffaa",
          dim: "rgba(0, 255, 170, 0.12)",
          text: "#00e596"
        },
        brandBlue: {
          DEFAULT: "#3b82f6",
          dim: "rgba(59, 130, 246, 0.12)"
        },
        status: {
          green: "#00d68f",
          greenDim: "rgba(0, 214, 143, 0.12)",
          red: "#ff4757",
          redDim: "rgba(255, 71, 87, 0.12)",
          yellow: "#fbbf24",
          yellowDim: "rgba(251, 191, 36, 0.12)",
          blue: "#60a5fa",
          blueDim: "rgba(96, 165, 250, 0.12)",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
      boxShadow: {
        card: "0 2px 20px rgba(0, 0, 0, 0.5)",
        accent: "0 0 20px rgba(0, 255, 170, 0.15)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

