/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf6f0",
        ink: "#2b2420",
        moss: "#4a5d43",
        clay: "#b5654a",
        gold: "#c8973a",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};
