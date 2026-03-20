/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',    // Extra small devices
        '3xl': '1920px',  // Full HD / 1080p desktops
        '4xl': '2560px',  // 2K / 1440p desktops
      },
      colors: {
        cream: '#F9F5EF',
        navy: '#0C2340',
        'navy-light': '#1a3a5c',
        'navy-dark': '#081a2e',
        purple: '#6D28D9',
        indigo: '#4F46E5',
        accent: '#7C3AED',
        gold: '#F59E0B',
        token: '#10B981'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-navy-purple': 'linear-gradient(135deg, #0C2340 0%, #4F46E5 50%, #6D28D9 100%)',
        'gradient-cream': 'linear-gradient(180deg, #F9F5EF 0%, #ffffff 100%)'
      },
      animation: {
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-out': 'slideOut 0.5s ease-in',
        'swipe-left': 'swipeLeft 0.3s ease-in',
        'swipe-right': 'swipeRight 0.3s ease-in',
        'swipe-up': 'swipeUp 0.3s ease-in'
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(-200%) rotate(-20deg)', opacity: '0' }
        },
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(200%) rotate(20deg)', opacity: '0' }
        },
        swipeUp: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-200%) rotate(0deg)', opacity: '0' }
        },
      },
    },
  },
  plugins: [],
}
