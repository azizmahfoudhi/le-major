import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F9F0F2',
          100: '#F0DDE1',
          200: '#DFBAC3',
          300: '#CE97A5',
          400: '#BD7487',
          500: '#8E3A50',
          600: '#7A2D42',
          700: '#5A2132',
          800: '#461A27',
          900: '#33131D',
          950: '#200C13',
        },
        gold: {
          50: '#FDF5F3',
          100: '#F8E5DF',
          200: '#F0C9C0',
          300: '#E4A99A',
          400: '#D4877A',
          500: '#C0685A',
          600: '#9E4E42',
          700: '#7D3A32',
          800: '#5E2B25',
          900: '#3F1C19',
        },
        academic: {
          bg: '#EFE9E9',
          border: '#E0D6D6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'reader': ['1.0625rem', { lineHeight: '1.85' }],
        'reader-h1': ['1.75rem', { lineHeight: '1.3' }],
        'reader-h2': ['1.5rem', { lineHeight: '1.35' }],
        'reader-h3': ['1.25rem', { lineHeight: '1.4' }],
      },
      maxWidth: {
        'reader': '720px',
        'content': '1280px',
      },
      borderRadius: {
        'card': '12px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
