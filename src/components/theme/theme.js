import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#9c182f",
    },

    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#3a3a3a",
      secondary: "#4B4F58",
      black: "#000000",
      light: "#B0825A",
      dark: "#5E3D24",
      contrastText: "#FFFFFF",
    },
  },

  typography: {
    h1: {
      fontSize: "3rem", // 48px
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem", // 32px
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
    },
    h5: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
    },
    h6: {
      fontSize: "0.95rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem", // 16px
    },
    body2: {
      fontSize: "0.9rem",
    },
  },

  spacing: 8,

  breakpoints: {
    values: {
      xs: 0,
      sm: 544,
      md: 921,
      lg: 1200,
      xl: 1536,
    },
  },

  shape: {
    borderRadius: 10,
  },
});

export default theme;
