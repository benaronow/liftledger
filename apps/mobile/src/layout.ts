import { SPACING } from "./theme";

export const FAB_SIZE = 40;
export const FAB_GAP = SPACING.sm;
export const FAB_EDGE = SPACING.lg;
export const FAB_TOP = SPACING.sm;

export const fabClusterWidth = (count: number) =>
  count * FAB_SIZE + Math.max(0, count - 1) * FAB_GAP;

export const titleRightInset = (count: number) =>
  FAB_EDGE + fabClusterWidth(count) + SPACING.lg;
