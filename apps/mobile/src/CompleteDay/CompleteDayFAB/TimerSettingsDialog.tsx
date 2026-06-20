import { KeyboardAvoidingView, Platform } from "react-native";
import { Button, Dialog, Portal } from "../../paper";
import { TimerSettings } from "../TimerSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

// A centered, solid dialog wrapping the timer presets. Paper's Dialog needs a
// Portal + Dialog.Content to render its surface — without them the presets
// floated over a bare scrim with no container behind them.
export const TimerSettingsDialog = ({ open, onClose }: Props) => {
  if (!open) return null;

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
        pointerEvents="box-none"
      >
        <Dialog visible={open} onDismiss={onClose}>
          <Dialog.Title style={{ textAlign: "center" }}>
            Rest Timer
          </Dialog.Title>
          <Dialog.Content>
            <TimerSettings onTimerStarted={onClose} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onClose}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
};
