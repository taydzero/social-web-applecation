/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'body-light': '#ffffff', //Светлая тема
        'body-dark': '#1a1a1a', //Тёмная тема
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

