import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingTabBarClearance } from "./FloatingTabBar";

export const BottomBlur = () => {
  const insets = useSafeAreaInsets();
  const height = floatingTabBarClearance(insets.bottom) + 24;

  return (
    <MaskedView
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height,
      }}
      maskElement={
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={["transparent", "black"]}
          locations={[0, 0.85]}
        />
      }
    >
      <BlurView
        intensity={70}
        tint="dark"
        blurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />
    </MaskedView>
  );
};
