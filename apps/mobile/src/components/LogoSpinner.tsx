import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useTheme } from "../providers/ThemeProvider";

// Full-screen spinning logo, mirroring web's LogoSpinner (spin + fade-in).
export const LogoSpinner = () => {
  const spin = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
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

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Animated.Image
        source={require("../../assets/logo.png")}
        style={{ height: 50, width: 50, opacity, transform: [{ rotate }] }}
      />
    </View>
  );
};
