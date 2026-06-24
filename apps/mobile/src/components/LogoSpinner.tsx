import { HeaderHeightContext } from "@react-navigation/elements";
import { useContext, useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useTheme } from "../paper";

export const LogoSpinner = () => {
  const spin = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
    ).start();
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [spin, opacity]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const { colors } = useTheme();

  const headerHeight = useContext(HeaderHeightContext) ?? 0;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <View style={{ transform: [{ translateY: -headerHeight / 2 }] }}>
        <Animated.Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require("../../assets/logo.png")}
          style={{ height: 50, width: 50, opacity, transform: [{ rotate }] }}
        />
      </View>
    </View>
  );
};
