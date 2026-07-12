import { isExerciseComplete, useCurrentSession } from "@liftledger/api-client";
import type { Exercise } from "@liftledger/shared";
import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, useTheme } from "react-native-paper";
import { env } from "../../config/env";
import { RADIUS, SPACING } from "../../theme";

const PULSE_PERIOD = 1400;
const PULSE_MAX_OPACITY = 0.4;

const Pulse = ({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) => {
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active || env.e2e) {
      phase.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: PULSE_PERIOD,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, phase]);

  const opacity = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, PULSE_MAX_OPACITY, 0],
  });

  return (
    <View style={{ borderRadius: RADIUS.pill, overflow: "hidden" }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#fff",
          opacity,
        }}
      />
    </View>
  );
};

const DOT_SIZE = 8;
const ACTIVE_DOT_SIZE = 12;

interface Props {
  pageIdx: number;
  onPageChange: (idx: number) => void;
  onFinish: () => void;
}

export const PagerBar = ({ pageIdx, onPageChange, onFinish }: Props) => {
  const { exercises, isSessionComplete } = useCurrentSession();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const isLastPage = pageIdx === exercises.length - 1;
  const currentComplete = isExerciseComplete(exercises[pageIdx]);

  const dotColor = (exercise: Exercise, idx: number) => {
    if (idx === pageIdx) return colors.secondary;
    if (isExerciseComplete(exercise)) return colors.primary;
    return colors.onSurfaceDisabled;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.md,
        paddingBottom: insets.bottom,
      }}
    >
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
        <Pulse active={isSessionComplete}>
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
        </Pulse>
      ) : (
        <Pulse active={currentComplete}>
          <IconButton
            style={{ margin: 0 }}
            icon="chevron-right"
            accessibilityLabel="Next exercise"
            mode="contained"
            containerColor={colors.primary}
            iconColor={colors.onPrimary}
            onPress={() => onPageChange(pageIdx + 1)}
          />
        </Pulse>
      )}
    </View>
  );
};
