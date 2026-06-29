import { isExerciseComplete, useCurrentSession } from "@liftledger/api-client";
import type { Exercise } from "@liftledger/shared";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomBlur } from "../../components/BottomBlur";
import { IconButton, useTheme } from "react-native-paper";
import { SPACING } from "../../theme";

const BAR_HEIGHT = 56;
const DOT_SIZE = 8;
const ACTIVE_DOT_SIZE = 12;

// Bottom padding screens need so scroll content clears the floating pager bar.
export const pagerBarClearance = (bottomInset: number) =>
  BAR_HEIGHT + bottomInset + SPACING.md;

interface Props {
  pageIdx: number;
  onPageChange: (idx: number) => void;
  // Fired by the checkmark that replaces the right arrow on the last exercise.
  onFinish: () => void;
}

// Floating pager controls at the bottom of the workout, sitting directly on
// the BottomBlur: page dots flanked by circular prev/next buttons. Any page
// can be visited; on the last exercise the right arrow becomes the finish-session
// checkmark, which unlocks once every set is logged.
export const PagerBar = ({ pageIdx, onPageChange, onFinish }: Props) => {
  const { exercises, isSessionComplete } = useCurrentSession();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const isLastPage = pageIdx === exercises.length - 1;

  const dotColor = (exercise: Exercise, idx: number) => {
    if (idx === pageIdx) return colors.secondary;
    if (isExerciseComplete(exercise)) return colors.primary;
    return colors.onSurfaceDisabled;
  };

  return (
    <>
      <BottomBlur height={pagerBarClearance(insets.bottom) + 24} />
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: insets.bottom,
          height: BAR_HEIGHT,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACING.md,
        }}
      >
        {/* The first exercise has nowhere to go back to — keep an invisible
            button so the dots stay centered. */}
        <IconButton
          style={{ margin: 0, opacity: pageIdx === 0 ? 0 : 1 }}
          icon="chevron-left"
          accessibilityLabel="Previous exercise"
          mode="contained"
          containerColor={colors.primary}
          iconColor={colors.onPrimary}
          disabled={pageIdx === 0}
          onPress={() => onPageChange(pageIdx - 1)}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.sm,
          }}
        >
          {exercises.map((exercise, idx) => {
            const size = idx === pageIdx ? ACTIVE_DOT_SIZE : DOT_SIZE;
            return (
              <View
                key={idx}
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: dotColor(exercise, idx),
                }}
              />
            );
          })}
        </View>
        {isLastPage ? (
          <IconButton
            style={{ margin: 0 }}
            icon="check"
            accessibilityLabel="Finish session"
            mode="contained"
            containerColor={
              isSessionComplete ? colors.tertiary : colors.surfaceDisabled
            }
            iconColor={isSessionComplete ? "white" : colors.onSurfaceDisabled}
            disabled={!isSessionComplete}
            onPress={onFinish}
          />
        ) : (
          <IconButton
            style={{ margin: 0 }}
            icon="chevron-right"
            accessibilityLabel="Next exercise"
            mode="contained"
            containerColor={colors.primary}
            iconColor={colors.onPrimary}
            onPress={() => onPageChange(pageIdx + 1)}
          />
        )}
      </View>
    </>
  );
};
