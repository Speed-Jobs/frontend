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
          red: '#C91A2A',
          'red-dark': '#B01A26',
          'red-light': '#D93347',
          'gray-dark': '#2a2a2a',
          'gray-light': '#404040',
        },
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#C91A2A',
          600: '#B01A26',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#7F1D1D',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

