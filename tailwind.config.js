/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        clay: "rgb(var(--color-clay) / <alpha-value>)",
        moss: "rgb(var(--color-moss) / <alpha-value>)",
        tide: "rgb(var(--color-tide) / <alpha-value>)",
        cocoa: "rgb(var(--color-cocoa) / <alpha-value>)",
        cream: "rgb(var(--color-cream) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(76, 57, 42, 0.13)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        serif: [
          "Lora",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif"
        ]
      }
    }
  },
  plugins: []
};
