/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Manrope', 'sans-serif'],
    },
    extend: {
      colors: {
        textprimary: "var(--textprimary)",
        textsecondary: "var(--textsecondary)",
      },
    },
  },
  plugins: [],
};