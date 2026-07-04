import { useTheme } from "react-native-paper";
import { Animated, View } from "react-native";
import { usePulse } from "./PulseProvider";

const SEG_GAP = 3;
const PULSE_MAX_OPACITY = 0.4;
const SKIPPED_COLOR = "#7D7D82";

const CurrentSegment = ({ color }: { color: string }) => {
  const phase = usePulse();
  const opacity = phase.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, PULSE_MAX_OPACITY, 0],
  });

  return (
    <View style={{ flex: 1, backgroundColor: color, overflow: "hidden" }}>
      <Animated.View
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

export const SegmentedBar = ({
  count,
  filled,
  skipped,
}: {
  count: number;
  filled: number;
  skipped?: Set<number>;
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, gap: SEG_GAP }}>
      {Array.from({ length: count }).map((_, i) =>
        i === filled ? (
          <CurrentSegment key={i} color={colors.secondary} />
        ) : (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor:
                i < filled
                  ? skipped?.has(i)
                    ? SKIPPED_COLOR
                    : colors.primary
                  : colors.secondaryContainer,
            }}
          />
        ),
      )}
    </View>
  );
};
