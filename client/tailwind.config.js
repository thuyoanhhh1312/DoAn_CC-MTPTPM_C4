/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf8ef',
          100: '#f9edcf',
          200: '#f3d89e',
          300: '#ecc06d',
          400: '#e5a83c',
          500: '#c48c46',
          600: '#a16e2f',
          700: '#7d5424',
          800: '#5c3d1c',
          900: '#3d2812',
        },
        brand: {
          dark: '#1a1a2e',
          deeper: '#16213e',
          accent: '#c48c46',
          light: '#faf7f2',
          surface: '#ffffff',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      screens: {
        desktop: '1200px',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px 0 rgba(0,0,0,0.12)',
        'header': '0 2px 20px 0 rgba(0,0,0,0.06)',
        'elegant': '0 4px 24px 0 rgba(196, 140, 70, 0.10)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
