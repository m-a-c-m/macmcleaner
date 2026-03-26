/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050508',
        surface: '#0d0d14',
        'surface-hover': '#13131e',
        'surface-elevated': '#181826',
        border: '#1a1a2e',
        primary: '#00d4ff',
        'primary-hover': '#00b8e6',
        accent: '#c940f0',
        'accent-hover': '#b030d8',
        'text-primary': '#f0f0ff',
        'text-muted': '#6b7280',
        'text-subtle': '#3a3a55',
        danger: '#ef4444',
        'danger-hover': '#dc2626',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #00d4ff 0%, #c940f0 100%)',
        'gradient-brand-r': 'linear-gradient(135deg, #c940f0 0%, #00d4ff 100%)',
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.15)',
        'glow-magenta':'0 0 20px rgba(201, 64, 240, 0.35)',
        'glow-brand':  '0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(201, 64, 240, 0.12)',
        'glow-sm':     '0 0 12px rgba(0, 212, 255, 0.35)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.5)',
        'inner-cyan':  'inset 0 1px 0 rgba(0, 212, 255, 0.12)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 25px rgba(0, 212, 255, 0.25), 0 0 25px rgba(201, 64, 240, 0.2)' },
          '50%':       { boxShadow: '0 0 50px rgba(0, 212, 255, 0.6), 0 0 50px rgba(201, 64, 240, 0.4)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'fade-in':    'fade-in 0.3s ease-out',
        'shimmer':    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
