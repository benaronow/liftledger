import { HeaderHeightContext } from "@react-navigation/elements";
import { useContext, useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme } from "react-native-paper";
import { env } from "../config/env";

const RING_SIZE = 72;
const STROKE = 4;
const LOGO_SIZE = 50;
const SPIN_DURATION = 1000;

export const LogoSpinner = ({ inline = false }: { inline?: boolean } = {}) => {
  const spin = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    if (env.e2e) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: SPIN_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 0.9),
        useNativeDriver: true,
      }),
    );
    loop.start();
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    return () => loop.stop();
  }, [spin, opacity]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const offsetY = inline ? 0 : -headerHeight / 2;

  const center = RING_SIZE / 2;
  const radius = (RING_SIZE - STROKE) / 2;
  const top = center - radius;
  const bottom = center + radius;
  const rightArc = `M ${center} ${top} A ${radius} ${radius} 0 0 1 ${center} ${bottom}`;
  const leftArc = `M ${center} ${top} A ${radius} ${radius} 0 0 0 ${center} ${bottom}`;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: offsetY }],
          opacity,
          width: RING_SIZE,
          height: RING_SIZE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: RING_SIZE,
            height: RING_SIZE,
            transform: [{ rotate }],
          }}
        >
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Defs>
              <LinearGradient
                id="ringRight"
                x1="0"
                y1={top}
                x2="0"
                y2={bottom}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={colors.primary} stopOpacity={1} />
                <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient
                id="ringLeft"
                x1="0"
                y1={top}
                x2="0"
                y2={bottom}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={colors.primary} stopOpacity={0} />
                <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Path
              d={rightArc}
              stroke="url(#ringRight)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={leftArc}
              stroke="url(#ringLeft)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require("../../assets/logo.png")}
          style={{ height: LOGO_SIZE, width: LOGO_SIZE }}
        />
      </Animated.View>
    </View>
  );
};
