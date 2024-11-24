module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,css}", // Include all files in src directory
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./components/**/*.{js,ts,jsx,tsx,mdx,css}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        teal: {
          500: "#1F4959",
          700: "#011425",
        },
        gray: {
          300: "#D9D9D9",
        },
        blue: {
          600: "#50727F",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
