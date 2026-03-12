/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 900ms ease-in-out forwards',
        'stat-from-left': 'statFromLeft 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'stat-from-right': 'statFromRight 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'stat-from-top': 'statFromTop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-left': 'fadeInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-right': 'fadeInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'none' }
        },
        statFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-80px) translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0) translateY(0)' }
        },
        statFromRight: {
          '0%': { opacity: '0', transform: 'translateX(80px) translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0) translateY(0)' }
        },
        statFromTop: {
          '0%': { opacity: '0', transform: 'translateY(-60px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(48px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(32px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
}

