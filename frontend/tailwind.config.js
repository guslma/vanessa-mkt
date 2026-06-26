/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Paleta extraída da logo "Vanessa MKT" (laranja/vermelho)
        brand: {
          50: '#fff4ed',
          100: '#ffe4cf',
          200: '#ffc69b',
          300: '#ffa15e',
          400: '#ff8a35',
          500: '#ff7600',
          600: '#f25c00',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
      },
    },
  },
  plugins: [],
};
