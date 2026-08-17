/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './site/**/*.{html,njk,js}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', '"Times New Roman"', 'serif'],
        display: ['"Fraunces"', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};
