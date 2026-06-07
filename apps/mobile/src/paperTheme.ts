// React Native Paper (MD3) themes built from the app's existing color palette
// (@liftledger/shared). The goal is color parity with the pre-Paper UI: every
// standard MD3 token is mapped onto a palette color so Paper's own components
// render in our colors, and every custom semantic key (danger, warning,
// container, dark, …) is preserved so `useTheme().colors.<name>` keeps working
// at call sites. Shapes/typography follow MD3 — only colors are held constant.
import { ColorPalette, DARK_COLORS, LIGHT_COLORS } from "@liftledger/shared";
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from "react-native-paper";

// The app's extra semantic colors layered on top of the standard MD3 tokens.
// `MD3Colors` is a `type` alias (not an interface), so it can't be module-
// augmented — instead we widen it here and surface it through the typed
// `useTheme` in ./paper.
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
  // --- standard MD3 tokens, mapped to our palette ---
  primary: p.primary,
  onPrimary: "white",
  primaryContainer: p.primaryDark,
  onPrimaryContainer: "white",
  secondary: p.secondary,
  onSecondary: "white",
  secondaryContainer: p.secondary,
  onSecondaryContainer: "white",
  tertiary: p.secondary,
  onTertiary: "white",
  background: p.background,
  onBackground: p.text,
  surface: p.container,
  onSurface: p.text,
  surfaceVariant: p.dark,
  onSurfaceVariant: p.textDisabled,
  surfaceDisabled: p.primaryDisabled,
  onSurfaceDisabled: p.textDisabled,
  outline: p.textDisabled,
  outlineVariant: p.textDisabled,
  error: p.danger,
  onError: "white",
  errorContainer: p.dangerDisabled,
  onErrorContainer: "white",
  // Elevated surfaces (Dialog, Menu, Surface, Card) use the "container" tone.
  elevation: {
    level0: "transparent",
    level1: p.container,
    level2: p.container,
    level3: p.container,
    level4: p.container,
    level5: p.container,
  },
  // --- custom semantic keys, preserved for direct `colors.<name>` reads ---
  primaryDark: p.primaryDark,
  primaryDisabled: p.primaryDisabled,
  dangerDisabled: p.dangerDisabled,
  warning: p.warning,
  success: p.success,
  container: p.container,
  dark: p.dark,
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
