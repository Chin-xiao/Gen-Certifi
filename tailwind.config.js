/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1d3fae",
          navy: "#152a73",
        },
      },
      fontFamily: {
        serif: ["'EB Garamond'", "Georgia", "serif"],
        ui: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
