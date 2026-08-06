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
          50: '#EBF2F8',
          100: '#D6E4F0',
          200: '#ADC9E1',
          300: '#84AED2',
          400: '#5B93C3',
          500: '#3278B4',
          600: '#2A4D7A',
          700: '#1E3A5F',
          800: '#162847',
          900: '#0F1D35',
          950: '#0A1425',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F5EDD6',
          200: '#EBDAAD',
          300: '#E0C884',
          400: '#D4B56A',
          500: '#C29F4C',
          600: '#A88638',
          700: '#8A6D2D',
          800: '#6C5523',
          900: '#4E3D19',
        },
        academic: {
          bg: '#F4F6FA',
          border: '#E8ECF2',
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
