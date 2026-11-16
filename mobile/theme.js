// File: theme.js
// This holds the colors, spacing and shadows for the whole app, with one set of colors for light mode and one for dark mode

// colors for light mode, the brand green is the same one the sign in button has always used
export const lightColors = {
  green: "#009e2a",
  greenDark: "#2d7a3a", // the SPROUT logo text
  greenSoft: "#e3f4e7", // light green behind icons and "Paid" pills
  red: "#c8452f",
  debt: "#8f3323", // header on the debt screen
  bg: "#f5f5f5", // behind everything
  card: "#ffffff",
  text: "#1c2a1f",
  muted: "#6b776e", // small grey text
  line: "#e4e8e4", // thin lines between rows
  input: "#f1f1f1",
};

// same names as above, just swapped out for dark mode
export const darkColors = {
  green: "#009e2a",
  greenDark: "#4caf5f",
  greenSoft: "#17331d",
  red: "#ff8a73",
  debt: "#8f3323",
  bg: "#101512",
  card: "#1a221c",
  text: "#e8efe9",
  muted: "#96a399",
  line: "#2a352d",
  input: "#232d26",
};

// every font size in the app gets multiplied by one of these (picked in settings)
export const fontScales = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

// spacing and corner sizes, so every screen lines up the same way
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20 };

// the soft shadow under cards, ios uses the shadow props and android uses elevation
export const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};
