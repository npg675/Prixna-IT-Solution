/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        navy: {
          50: "#F5F7FC",
          100: "#E8EDF7",
          200: "#C9D4EA",
          300: "#9DB1D4",
          400: "#64748B",
          500: "#3D4E6E",
          600: "#2A3D66",
          700: "#22334F",
          800: "#182747",
          900: "#14213B",
          950: "#101B35",
        },
        royal: {
          50: "#EEF2FF",
          100: "#E0E8FF",
          200: "#C7D4FE",
          300: "#A4B8FC",
          400: "#8098F9",
          500: "#6172F3",
          600: "#3563FF",
          700: "#2B4FD6",
          800: "#2740A8",
          900: "#233A85",
        },
        tech: {
          DEFAULT: "#22D3EE",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
        },
        electric: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#b8dfff",
          300: "#84caff",
          400: "#4aa8ff",
          500: "#1e8bff",
          600: "#006fd9",
          700: "#0057ad",
          800: "#074889",
          900: "#0d3d6f",
          950: "#0a2746",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "headline-lg": ["1.875rem", { lineHeight: "1.3" }],
        "headline-md": ["1.5rem", { lineHeight: "1.35" }],
        "headline-sm": ["1.25rem", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.5" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      boxShadow: {
        "premium": "0 4px 24px -4px hsl(var(--primary) / 0.15), 0 0 0 1px hsl(var(--border))",
        "premium-lg": "0 12px 48px -8px hsl(var(--primary) / 0.2), 0 0 0 1px hsl(var(--border))",
        "card": "0 2px 16px -4px hsl(var(--foreground) / 0.06), 0 0 0 1px hsl(var(--border))",
        "card-hover": "0 8px 32px -8px hsl(var(--foreground) / 0.1), 0 0 0 1px hsl(var(--border))",
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.2, 0, 0, 1)",
        "premium-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-up": "slide-up 0.5s cubic-bezier(0.2, 0, 0, 1)",
        "slide-down": "slide-down 0.4s cubic-bezier(0.2, 0, 0, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
};

export default config;