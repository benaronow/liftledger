import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const PULSE_PERIOD = 2000;
const BAND_HEIGHT_RATIO = 0.9;
const BAND_MIN_HEIGHT = 40;
const BAND_OPACITY = 0.2;

type Props = { fillHeight: number };

export const BarPulse = ({ fillHeight }: Props) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: PULSE_PERIOD,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const bandHeight = Math.max(fillHeight * BAND_HEIGHT_RATIO, BAND_MIN_HEIGHT);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: bandHeight,
        opacity: progress.interpolate({
          inputRange: [0, 0.12, 0.88, 1],
          outputRange: [0, BAND_OPACITY, BAND_OPACITY, 0],
        }),
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [fillHeight - bandHeight / 2, -bandHeight / 2],
            }),
          },
        ],
      }}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          "rgba(255,255,255,1)",
          "rgba(255,255,255,0)",
        ]}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};
