import { MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "../../paper";
import { SPACING } from "../../theme";
import { TimerSettings } from "../TimerSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

// A centered, solid dialog wrapping the timer presets. Mirrors
// ConfirmationDialog's header row (title + inline icon) and content/action
// spacing so it reads as part of the same dialog family; it stays bespoke
// because its only action is Close (the presets self-dismiss on tap).
export const TimerSettingsDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();

  if (!open) return null;

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
        pointerEvents="box-none"
      >
        <Dialog visible={open} onDismiss={onClose}>
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
            <Text variant="headlineSmall" style={{ flexShrink: 1, textAlign: "center" }}>
              Rest Timer
            </Text>
            <MaterialCommunityIcons
              name="timer-outline"
              size={24}
              color={colors.primary}
            />
          </View>
          <Dialog.Content style={{ paddingBottom: SPACING.sm }}>
            <TimerSettings onTimerStarted={onClose} />
          </Dialog.Content>
          <Dialog.Actions
            style={{
              gap: SPACING.sm,
              paddingTop: 0,
              paddingHorizontal: SPACING.lg,
              paddingBottom: SPACING.md,
            }}
          >
            <Button onPress={onClose}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
};
