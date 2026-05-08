/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f0e7",
        ink: "#2f2b27",
        clay: "#c98263",
        moss: "#7f9571",
        tide: "#6f929b",
        cocoa: "#5f4a3d",
        cream: "#fffaf2"
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
