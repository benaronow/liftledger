import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { useTimerCountdown } from "../../components/timer";
import type { RootStackParamList } from "../types";
import { FONT, RADIUS, SPACING } from "../../theme";

export const HeaderTimer = () => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isActive, timeString } = useTimerCountdown();

  if (!isActive) return null;

  const tint = colors.onPrimaryContainer;

  return (
    <TouchableRipple
      borderless
      accessibilityRole="button"
      accessibilityLabel="Open workout"
      onPress={() => navigation.navigate("CompleteSession")}
      style={{ borderRadius: RADIUS.pill }}
    >
      <View
        style={{
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        }}
      >
        <Text
          style={{
            fontSize: FONT.sm,
            fontWeight: "600",
            color: tint,
            fontVariant: ["tabular-nums"],
          }}
        >
          {timeString}
        </Text>
      </View>
    </TouchableRipple>
  );
};
