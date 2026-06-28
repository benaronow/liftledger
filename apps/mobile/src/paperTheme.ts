import { ColorPalette, DARK_COLORS, LIGHT_COLORS } from "@liftledger/shared";
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from "react-native-paper";

export type AppColors = MD3Theme["colors"] & {
  primaryDark: string;
  primaryDisabled: string;
  dangerDisabled: string;
  warning: string;
  success: string;
  container: string;
  dark: string;
  text: string;
  textDisabled: string;
  danger: string;
};

export type AppTheme = Omit<MD3Theme, "colors"> & { colors: AppColors };

const buildColors = (p: ColorPalette, base: MD3Theme): AppColors => ({
  ...base.colors,
  primary: p.primary,
  // Content on the solid primary fill is white in both schemes — primary is the
  // same saturated blue in light and dark, so button icons/labels shouldn't flip
  // to dark text in light mode.
  onPrimary: "white",
  primaryDisabled: p.primaryDisabled,
  primaryContainer: p.darkContainer,
  onPrimaryContainer: p.text,
  secondary: p.secondary,
  onSecondary: p.text,
  secondaryContainer: p.lightContainer,
  onSecondaryContainer: p.text,
  tertiary: p.secondary,
  onTertiary: p.text,
  background: p.background,
  onBackground: p.text,
  surface: p.darkContainer,
  onSurface: p.text,
  surfaceVariant: p.lightContainer,
  onSurfaceVariant: p.text,
  surfaceDisabled: p.primaryDisabled,
  onSurfaceDisabled: p.textDisabled,
  outline: p.textDisabled,
  outlineVariant: p.textDisabled,
  error: p.danger,
  onError: "white",
  errorContainer: p.dangerContainer,
  onErrorContainer: "white",
  elevation: {
    level0: "transparent",
    level1: p.lightContainer,
    level2: p.lightContainer,
    level3: p.lightContainer,
    level4: p.lightContainer,
    level5: p.lightContainer,
  },
  primaryDark: DARK_COLORS.background,
  dangerDisabled: p.dangerDisabled,
  warning: p.warning,
  success: p.success,
  container: p.darkContainer,
  dark: p.lightContainer,
  text: p.text,
  textDisabled: p.textDisabled,
  danger: p.danger,
});

export const AppDarkTheme: AppTheme = {
  ...MD3DarkTheme,
  roundness: 2,
  colors: buildColors(DARK_COLORS, MD3DarkTheme),
};

export const AppLightTheme: AppTheme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: buildColors(LIGHT_COLORS, MD3LightTheme),
};
