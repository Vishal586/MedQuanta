/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F6F4",
        ink: "#1B2B2B",
        panel: "#FFFFFF",
        hairline: "#D9DDD9",
        teal: {
          DEFAULT: "#2F6F62",
          dark: "#204E44",
          light: "#E7EFEC",
        },
        clay: {
          DEFAULT: "#B5533C",
          light: "#F5E7E3",
        },
        muted: "#5C6B69",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
