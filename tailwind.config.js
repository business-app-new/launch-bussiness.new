/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285F4',
          red: '#EA4335',
          yellow: '#FBBC04',
          green: '#34A853',
          black: '#202124',
          gray: '#5F6368',
        }
      },
      fontFamily: {
        'google': ['Google Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
