/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        surface: '#111827',
        card: '#1F2937',
        primary: '#38BDF8',
        accent: '#818CF8',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#334155',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
