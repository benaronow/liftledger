import { HeaderHeightContext } from "@react-navigation/elements";
import { useContext, useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useTheme } from "react-native-paper";
import { env } from "../config/env";

export const LogoSpinner = ({ inline = false }: { inline?: boolean } = {}) => {
  const spin = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Under E2E the spin loop never ends, so Maestro can't settle on any screen
    // showing the loading logo. Show it static and fully opaque instead.
    if (env.e2e) {
      opacity.setValue(1);
      return;
    }
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
  const offsetY = inline ? 0 : -headerHeight / 2;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <View style={{ transform: [{ translateY: offsetY }] }}>
        <Animated.Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require("../../assets/logo.png")}
          style={{ height: 50, width: 50, opacity, transform: [{ rotate }] }}
        />
      </View>
    </View>
  );
};
