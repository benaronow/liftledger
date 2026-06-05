export type ColorPalette = {
  background: string;
  primary: string;
  primaryDark: string;
  primaryDisabled: string;
  secondary: string;
  /** Header / nav-bar / deepest surface */
  dark: string;
  /** Card / elevated surface */
  container: string;
  /** Primary body text */
  text: string;
  textDisabled: string;
  danger: string;
  dangerDisabled: string;
  warning: string;
  success: string;
};

export const DARK_COLORS: ColorPalette = {
  background: "#3c3c3e",
  primary: "#0096FF",
  primaryDark: "#004b7f",
  primaryDisabled: "#317baf",
  secondary: "#BA209E",
  dark: "#131314",
  container: "#58585b",
  text: "#ffffff",
  textDisabled: "#a7a7a7",
  danger: "#dc3545",
  dangerDisabled: "#C94F5A",
  warning: "#ffc107",
  success: "#09c104",
};

export const LIGHT_COLORS: ColorPalette = {
  background: "#ffffff",
  primary: "#0096FF",
  primaryDark: "#004b7f",
  primaryDisabled: "#317baf",
  secondary: "#BA209E",
  dark: "#E7E7E7",
  container: "#e5e5ea",
  text: "#1c1c1e",
  textDisabled: "#8e8e93",
  danger: "#dc3545",
  dangerDisabled: "#C94F5A",
  warning: "#ffc107",
  success: "#09c104",
};

/** @deprecated Import DARK_COLORS or useTheme() instead */
export const COLORS = DARK_COLORS;
