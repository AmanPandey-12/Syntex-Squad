/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        krishi: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
          500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
          dark: '#0f291e', vibrant: '#40916c', accent: '#ffb703', earth: '#92400e',
        }
      },
      boxShadow: {
        'krishi': '0 10px 40px -10px rgba(8, 17, 13, 0.4), 0 4px 20px -5px rgba(21, 128, 61, 0.1)',
        'krishi-xl': '0 25px 60px -15px rgba(8, 17, 13, 0.5), 0 10px 30px -5px rgba(21, 128, 61, 0.2)',
        'krishi-glow': '0 0 30px rgba(34, 197, 94, 0.15)',
      }
    },
  },
  plugins: [],
}
