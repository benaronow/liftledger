import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { TopSheet } from "../../components/TopSheet";
import { RADIUS, SPACING } from "../../theme";
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
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: SPACING.lg,
              paddingHorizontal: SPACING.lg,
            }}
          >
            <Text
              variant="headlineSmall"
              style={{ flexShrink: 1, textAlign: "center" }}
            >
              Rest Timer
            </Text>
          </View>
          <View
            style={{
              paddingVertical: SPACING.xl,
              paddingHorizontal: SPACING.lg,
            }}
          >
            <TimerSettings onTimerStarted={onClose} />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingTop: SPACING.sm,
              paddingBottom: SPACING.md,
              backgroundColor: colors.secondaryContainer,
              paddingHorizontal: SPACING.xs,
              borderBottomLeftRadius: RADIUS.xl,
              borderBottomRightRadius: RADIUS.xl,
            }}
          >
            <Button onPress={onClose}>Close</Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </TopSheet>
  );
};
