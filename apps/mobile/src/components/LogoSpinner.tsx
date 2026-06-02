import { COLORS } from "@liftledger/shared";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

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

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/icon.png")}
        style={[styles.logo, { opacity, transform: [{ rotate }] }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  logo: { height: 50, width: 50 },
});
