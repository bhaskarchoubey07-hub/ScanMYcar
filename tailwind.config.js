/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "#091827",
        glow: "#34d399",
        neon: "#38bdf8"
      },
      boxShadow: {
        glass: "0 24px 80px rgba(8, 15, 34, 0.45)",
        neon: "0 0 0 1px rgba(56, 189, 248, 0.18), 0 18px 60px rgba(56, 189, 248, 0.18)"
      }
    }
  },
  plugins: []
};
