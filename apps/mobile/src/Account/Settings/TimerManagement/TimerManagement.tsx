import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  useTimerSettings,
  useUpdateTimerSettings,
} from "@liftledger/api-client";
import { useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AppTextInput } from "../../../components/inputs";
import { SectionCard } from "../../../components/SectionCard";
import { TimePicker } from "../../../components/TimePicker";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { SPACING } from "../../../theme";
import { AlarmSoundSelect } from "./AlarmSoundSelect";
import {
  ExerciseTimerOverridesModal,
  formatTime,
} from "./ExerciseTimerOverridesModal";
import { ToggleSetting } from "./ToggleSetting";

export const TimerManagement = () => {
  const { colors } = useTheme();
  const { data: timerSettingsData } = useTimerSettings();
  const { send: triggerUpdateTimerSettings } = useUpdateTimerSettings();
  const { showSnackbar } = useSnackbar();

  const settings = timerSettingsData?.timerSettings;
  const defaultEnabled = settings?.defaultEnabled ?? true;
  const defaultTime = settings?.defaultTime ?? 120;
  const notify = settings?.notify ?? true;

  const [editOpen, setEditOpen] = useState(false);
  const [draftTime, setDraftTime] = useState(defaultTime);
  const [saving, setSaving] = useState(false);

  const openEdit = () => {
    setDraftTime(defaultTime);
    setEditOpen(true);
  };

  const saveDefaultTime = async () => {
    setSaving(true);
    try {
      await triggerUpdateTimerSettings({ patch: { defaultTime: draftTime } });
      setEditOpen(false);
    } catch {
      showSnackbar("Failed to update default time.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Rest Timer">
      <ToggleSetting
        label="Notifications"
        description="Notification sent on timer completion"
        value={notify}
        onChange={(enabled) =>
          triggerUpdateTimerSettings({ patch: { notify: enabled } })
        }
      />
      <AlarmSoundSelect />
      <View style={{ paddingVertical: SPACING.md }}>
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.outlineVariant,
          }}
        />
      </View>
      <ToggleSetting
        label="Start automatically"
        description="Timer starts on set completion"
        value={defaultEnabled}
        onChange={(enabled) =>
          triggerUpdateTimerSettings({ patch: { defaultEnabled: enabled } })
        }
      />
      <View>
        <View pointerEvents="none">
          <AppTextInput
            label="Default time"
            value={formatTime(defaultTime)}
            editable={false}
            disabled={!defaultEnabled}
          />
        </View>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={defaultEnabled ? openEdit : undefined}
        />
      </View>
      <ExerciseTimerOverridesModal />
      <ConfirmationDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Default Rest Time"
        action="Save"
        onConfirm={saveDefaultTime}
        confirming={saving}
      >
        <TimePicker totalSeconds={draftTime} onChange={setDraftTime} />
      </ConfirmationDialog>
    </SectionCard>
  );
};
