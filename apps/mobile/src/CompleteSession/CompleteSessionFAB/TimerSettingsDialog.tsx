import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { TopSheet } from "../../components/TopSheet";
import { SPACING } from "../../theme";
import { TimerSettings } from "../TimerSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const TimerSettingsDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();

  return (
    <TopSheet open={open} onClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: SPACING.sm,
              marginTop: SPACING.lg,
              marginBottom: SPACING.md,
              paddingHorizontal: SPACING.lg,
            }}
          >
            <Text
              variant="headlineSmall"
              style={{ flexShrink: 1, textAlign: "center" }}
            >
              Rest Timer
            </Text>
            <MaterialCommunityIcons
              name="timer-outline"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ paddingVertical: SPACING.md }}>
            <TimerSettings onTimerStarted={onClose} />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingTop: SPACING.sm,
              paddingBottom: SPACING.md,
            }}
          >
            <Button onPress={onClose}>Close</Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </TopSheet>
  );
};
