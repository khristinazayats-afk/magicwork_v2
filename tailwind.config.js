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


