import type { Config } from "tailwindcss";
import rtl from "tailwindcss-rtl";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
          dark: "hsl(var(--primary-dark))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        slate: {
          50: "hsl(210 40% 98%)",
          100: "hsl(210 40% 96%)",
          200: "hsl(214 32% 91%)",
          300: "hsl(213 27% 84%)",
          400: "hsl(215 20% 65%)",
          500: "hsl(215 16% 47%)",
          600: "hsl(215 19% 35%)",
          700: "hsl(215 25% 27%)",
          800: "hsl(217 33% 17%)",
          900: "hsl(222 47% 11%)",
        },
        blue: {
          50: "hsl(214 100% 97%)",
          100: "hsl(214 95% 93%)",
          200: "hsl(213 97% 87%)",
          300: "hsl(212 96% 78%)",
          400: "hsl(213 94% 68%)",
          500: "hsl(217 91% 60%)",
          600: "hsl(221 83% 53%)",
          700: "hsl(224 76% 48%)",
          800: "hsl(226 71% 40%)",
          900: "hsl(224 64% 33%)",
        },
        emerald: {
          50: "hsl(152 76% 96%)",
          100: "hsl(149 80% 90%)",
          200: "hsl(152 76% 80%)",
          300: "hsl(156 72% 67%)",
          400: "hsl(158 64% 52%)",
          500: "hsl(160 84% 39%)",
          600: "hsl(161 94% 30%)",
          700: "hsl(163 94% 24%)",
          800: "hsl(163 88% 20%)",
          900: "hsl(164 86% 16%)",
        },
        purple: {
          50: "hsl(270 100% 98%)",
          100: "hsl(269 100% 95%)",
          200: "hsl(269 100% 92%)",
          300: "hsl(269 97% 85%)",
          400: "hsl(270 95% 75%)",
          500: "hsl(271 91% 65%)",
          600: "hsl(271 81% 56%)",
          700: "hsl(272 72% 47%)",
          800: "hsl(273 67% 39%)",
          900: "hsl(274 66% 32%)",
        },
        amber: {
          50: "hsl(48 100% 96%)",
          100: "hsl(48 96% 89%)",
          200: "hsl(48 97% 77%)",
          300: "hsl(46 97% 65%)",
          400: "hsl(43 96% 56%)",
          500: "hsl(38 92% 50%)",
          600: "hsl(32 95% 44%)",
          700: "hsl(26 90% 37%)",
          800: "hsl(23 83% 31%)",
          900: "hsl(22 78% 26%)",
        },
        red: {
          50: "hsl(0 86% 97%)",
          100: "hsl(0 93% 94%)",
          200: "hsl(0 96% 89%)",
          300: "hsl(0 94% 82%)",
          400: "hsl(0 91% 71%)",
          500: "hsl(0 84% 60%)",
          600: "hsl(0 72% 51%)",
          700: "hsl(0 74% 42%)",
          800: "hsl(0 70% 35%)",
          900: "hsl(0 63% 31%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), rtl],
} satisfies Config;
