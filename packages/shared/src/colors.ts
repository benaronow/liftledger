export type ColorPalette = {
  background: string;
  primaryContainer: string;
  secondaryContainer: string;
  dangerContainer: string;
  primary: string;
  primaryDisabled: string;
  secondary: string;
  secondaryDisabled: string;
  text: string;
  textDisabled: string;
  danger: string;
  dangerDisabled: string;
  warning: string;
  success: string;
};

export const LIGHT_COLORS: ColorPalette = {
  background: "#ffffff",
  primaryContainer: "#e5e5ea",
  secondaryContainer: "#d2d2d2",
  dangerContainer: "#f76575",
  primary: "#0096ff",
  primaryDisabled: "#317baf",
  secondary: "#ff40ed",
  secondaryDisabled: "#ad5598",
  text: "#1c1c1e",
  textDisabled: "#8e8e93",
  danger: "#dc3545",
  dangerDisabled: "#b0464f",
  warning: "#ffc107",
  success: "#09c104",
};

export const DARK_COLORS: ColorPalette = {
  background: "#131314",
  primaryContainer: "#232324",
  secondaryContainer: "#3C3C3E",
  dangerContainer: "#f76575",
  primary: "#0096ff",
  primaryDisabled: "#317baf",
  secondary: "#ff40ed",
  secondaryDisabled: "#ad5598",
  text: "#ffffff",
  textDisabled: "#a7a7a7",
  danger: "#dc3545",
  dangerDisabled: "#b0464f",
  warning: "#ffc107",
  success: "#09c104",
};

/** @deprecated Import DARK_COLORS or useTheme() instead */
export const COLORS = DARK_COLORS;
