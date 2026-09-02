/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        vazir: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      colors: {
        gold: {
          50: "#fef7e8",
          100: "#fdeabc",
          200: "#fcd88b",
          300: "#fbc45a",
          400: "#f5a623",
          500: "#d4900a",
          600: "#b87a06",
          700: "#8c5c04",
          800: "#603e03",
          900: "#332101",
        },
      },
      borderRadius: {
        xl: "22px",
        "2xl": "28px",
      },
    },
  },
  plugins: [],
};
