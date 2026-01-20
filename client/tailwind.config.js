/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GalaChain brand colors
        gala: {
          primary: '#6366f1', // Indigo primary
          secondary: '#8b5cf6', // Purple secondary
          accent: '#f59e0b', // Amber accent
          dark: '#1e1b4b', // Dark purple background
          light: '#f5f3ff', // Light purple tint
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
