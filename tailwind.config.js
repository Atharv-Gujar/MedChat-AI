/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#0f1117',
          800: '#161822',
          700: '#1e2030',
        },
        brand: {
          50: '#eef7ff',
          100: '#d8edff',
          200: '#b9dfff',
          400: '#4da3ff',
          500: '#2b7fff',
          600: '#1a65db',
        },
        surface: {
          light: '#f0f4fa',
          card: '#ffffff',
          'card-dark': '#1a1d2e',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.08)',
        'sidebar': '2px 0 24px rgba(0,0,0,0.04)',
        'input': '0 2px 8px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in': 'slideIn 0.35s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'typing-bounce': 'typingBounce 1.4s ease-in-out infinite',
        'card-enter': 'cardEnter 0.6s ease-out backwards',
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(43,127,255,0.12)' },
          '50%': { boxShadow: '0 0 40px rgba(43,127,255,0.25)' },
        },
        typingBounce: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        cardEnter: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
