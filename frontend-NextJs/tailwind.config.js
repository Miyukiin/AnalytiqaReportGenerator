module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Include all files in src directory
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
        mainblue: {
          default: "#50727F",
        },
        maingreen: {
          defaut: "#65974F",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"], // Existing fonts
        geist: ["Geist", "sans-serif"], // New custom font
        geistmono: ["GeistMono", "monospace"], // New custom font
      },
    },
  },
  plugins: [],
};
