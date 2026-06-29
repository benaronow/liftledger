import { useEffect, useRef } from "react";
import { useTheme } from "react-native-paper";
import { Animated, Easing, View } from "react-native";

const SEG_GAP = 3;
const PULSE_MAX_OPACITY = 0.4;
const PULSE_DURATION = 1000;

const CurrentSegment = ({ color }: { color: string }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

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
          opacity: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0, PULSE_MAX_OPACITY],
          }),
        }}
      />
    </View>
  );
};

export const SegmentedBar = ({
  count,
  filled,
}: {
  count: number;
  filled: number;
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
              backgroundColor: i < filled ? colors.primary : colors.secondaryContainer,
            }}
          />
        ),
      )}
    </View>
  );
};
