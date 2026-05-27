/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D10",
        card: "#151821",
        primary: "#7C5CFF",
        secondary: "#4DA2FF",
        textPrimary: "#FFFFFF",
        textSecondary: "#A0A8B8",
      },
    },
  },
  plugins: [],
}