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
        'magiwork-beige': '#fcf8f2',
        'magiwork-cream': '#f5f0e8',
        'magiwork-green': '#94d1c4',
        'magiwork-dark-green': '#1e2d2e',
        'magiwork-mint': '#94d1c4',
        'magiwork-orange': '#ffaf42',
      },
      fontFamily: {
        'actay': ['Actay Wide', 'sans-serif'],
        'hanken': ['Hanken Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


