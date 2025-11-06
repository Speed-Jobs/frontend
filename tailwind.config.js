/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sk: {
          black: '#000000',
          'black-light': '#1a1a1a',
          'black-dark': '#0a0a0a',
          red: '#E60012',
          'red-dark': '#CC0010',
          'red-light': '#FF1A2E',
          'gray-dark': '#2a2a2a',
          'gray-light': '#404040',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

