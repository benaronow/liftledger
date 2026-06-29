import { ColorPalette, DARK_COLORS, LIGHT_COLORS } from "@liftledger/shared";
import { MD3DarkTheme, MD3LightTheme, MD3Theme } from "react-native-paper";

const buildColors = (p: ColorPalette, base: MD3Theme): MD3Theme["colors"] => ({
  ...base.colors,
  primary: p.primary,
  onPrimary: "white",
  primaryContainer: p.primaryContainer,
  onPrimaryContainer: p.text,
  secondary: p.secondary,
  onSecondary: p.text,
  secondaryContainer: p.secondaryContainer,
  onSecondaryContainer: p.text,
  tertiary: p.success,
  onTertiary: p.text,
  tertiaryContainer: p.warning,
  onTertiaryContainer: p.text,
  background: p.background,
  onBackground: p.text,
  surface: p.primaryContainer,
  onSurface: p.text,
  surfaceVariant: p.secondaryContainer,
  onSurfaceVariant: p.text,
  surfaceDisabled: p.primaryDisabled,
  onSurfaceDisabled: p.textDisabled,
  outline: p.textDisabled,
  outlineVariant: p.textDisabled,
  error: p.danger,
  onError: "white",
  errorContainer: p.dangerDisabled,
  onErrorContainer: "white",
  inversePrimary: DARK_COLORS.background,
  elevation: {
    level0: "transparent",
    level1: p.primaryContainer,
    level2: p.primaryContainer,
    level3: p.primaryContainer,
    level4: p.primaryContainer,
    level5: p.primaryContainer,
  },
});

export const AppDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 2,
  colors: buildColors(DARK_COLORS, MD3DarkTheme),
};

export const AppLightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: buildColors(LIGHT_COLORS, MD3LightTheme),
};
