// Spacing / typography / radius scale shared across the mobile UI, so screens
// and primitives don't sprinkle magic numbers. Colors live in COLORS
// (@liftledger/shared) — this only covers layout dimensions.
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 20,
  pill: 999,
} as const;

export const FONT = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 25,
  xxl: 28,
} as const;

// Shared height for outlined form controls (text inputs, selects, date fields)
// so every field lines up regardless of which primitive renders it.
export const INPUT_HEIGHT = 45;
