/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bottom-[15%]',
    'md:bottom-[20%]',
    'top-[15%]',
    'md:top-[20%]',
  ],
  theme: {
    extend: {
      colors: {
        // Pastel and earthy colors for calm, relaxing aesthetic
        sage: {
          50: '#f6f7f6',
          100: '#e3e8e3',
          200: '#c7d4c7',
          300: '#a8b8a8',
          400: '#8a9d8a',
          500: '#6d826d',
          600: '#556855',
          700: '#435043',
          800: '#2e382e',
        },
        sand: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#e8e4dd',
          300: '#d4c5b9',
          400: '#c9b8aa',
          500: '#b8a896',
          600: '#a69582',
          700: '#8a7968',
          800: '#6d5f52',
        },
        lavender: {
          50: '#faf9fc',
          100: '#f3f0f7',
          200: '#e6dfed',
          300: '#d4c8de',
          400: '#b8a8c9',
          500: '#9c88b3',
          600: '#7f6d96',
        },
        peach: {
          50: '#fef8f5',
          100: '#fdf0ea',
          200: '#fae0d4',
          300: '#f6c9b3',
          400: '#f1ab8c',
          500: '#ec8d65',
        },
        apricot: {
          50: '#fef7f2',
          100: '#fceedf',
          200: '#f9dcc0',
          300: '#f5c496',
          400: '#f0a56b',
        },
        rose: {
          50: '#fef7f7',
          100: '#fceeee',
          200: '#f9dddd',
          300: '#f4c4c4',
          400: '#eda3a3',
        },
        // Soft pastel pinks
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
        },
        // Soft pastel blues
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        // Soft pastel purples
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
        },
        // Soft pastel orange
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
        },
        // Magicwork brand colors
        'magicwork-beige': '#fcf8f2',
        'magicwork-cream': '#f5f0e8',
        'magicwork-green': '#94d1c4',
        'magicwork-dark-green': '#1e2d2e',
        'magicwork-mint': '#94d1c4',
        'magicwork-orange': '#ffaf42',
      },
      fontFamily: {
        'actay': ['Actay Wide', 'sans-serif'],
        'hanken': ['Hanken Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


