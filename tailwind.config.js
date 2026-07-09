/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rasala: {
          dark:    "#0e1a10",
          forest:  "#1c2b1e",
          gold:    "#d4af37",
          goldLight: "#f5e07a",
          cream:   "#f4f1ea",
          brown:   "#5c4033",
        }
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, rgba(14,26,16,0) 0%, rgba(14,26,16,0.7) 60%, rgba(14,26,16,1) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(28,43,30,0.9) 0%, rgba(14,26,16,0.95) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4af37, #a87e20)',
      },
      boxShadow: {
        'gold': '0 0 24px rgba(212,175,55,0.3)',
        'gold-lg': '0 0 48px rgba(212,175,55,0.25)',
        'cinema': '0 24px 80px rgba(0,0,0,0.8)',
      },
      animation: {
        'pin-pulse': 'pin-pulse 2s ease-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'fade-up': 'fadeInUp 0.7s ease both',
        'fade-in': 'fadeIn 0.5s ease both',
        'shimmer': 'shimmer 4s linear infinite',
      },
    },
  },
  plugins: [],
}
