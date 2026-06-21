import { SPACING } from "./theme";

// Shared geometry for screens with pinned top-right action buttons and a
// scrolling page title (top-left, across from the FABs) — Program's editor and
// CompleteDay's workout pages. The title is rendered inside the scroll content
// but must line up with the pinned FABs when scrolled to the top, so both the
// FAB cluster and the title derive their position from these constants. The
// screens sit below the stack header, which already covers the status bar, so
// the top offset is measured from the header — not the safe-area inset.

// Paper's `size="small"` FAB renders at 40dp.
export const FAB_SIZE = 40;
// Horizontal gap between adjacent FABs.
export const FAB_GAP = SPACING.sm;
// Inset of the FAB cluster / title from the screen's side edges.
export const FAB_EDGE = SPACING.lg;
// Gap below the stack header before the FAB cluster / title begin.
export const FAB_TOP = SPACING.sm;

// Total width occupied by `count` FABs laid out in a row.
export const fabClusterWidth = (count: number) =>
  count * FAB_SIZE + Math.max(0, count - 1) * FAB_GAP;

// Right padding the title needs so it stops short of the FAB cluster.
export const titleRightInset = (count: number) =>
  FAB_EDGE + fabClusterWidth(count) + SPACING.lg;
