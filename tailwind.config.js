/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-pattern': "url('/src/assets/images/bgimg.svg')",
      },
      screens: {
        '3xl-custom': '1800px',
      },
    },
  },
  plugins: [],
};
