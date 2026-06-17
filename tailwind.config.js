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
        background: '#0B0F19',
        surface: '#111827',
        card: '#1A2234',
        primary: '#4F46E5',
        accent: '#06B6D4',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: '#1E293B',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
