// src/theme.ts

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#50727F", // Tailwind's mainblue.DEFAULT
    },
    secondary: {
      main: "#65974F", // Tailwind's maingreen.DEFAULT
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    grey: {
      100: "#ECECEC",
      200: "#ADBBC6",
      300: "#D9D9D9",
      400: "#DDDFE5",
      700: "#011425", // Tailwind's teal.700
      800: "#000000", // Tailwind's black
    },
    text: {
      primary: "#1F4959", // Tailwind's teal.500
      secondary: "#011425", // Tailwind's teal.700
    },
    background: {
      default: "#F5F5F5", // Equivalent to Tailwind's grey.100
    },
  },
  typography: {
    fontFamily: 'Wix Madefor Text, sans-serif', // Tailwind's custom font
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Disable uppercase transformation
        },
      },
    },
  },
});

export default theme;
