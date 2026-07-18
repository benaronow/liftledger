import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  useTimerSettings,
  useUpdateTimerSettings,
} from "@liftledger/api-client";
import { Switch, Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AppTextInput } from "../../../components/inputs";
import { SectionCard } from "../../../components/SectionCard";
import { TimePicker } from "../../../components/TimePicker";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, SPACING } from "../../../theme";
import { AlarmSoundSelect } from "./AlarmSoundSelect";
import {
  ExerciseTimerOverridesModal,
  formatTime,
} from "./ExerciseTimerOverridesModal";

const ToggleSetting = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => Promise<unknown>;
  disabled?: boolean;
}) => {
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const shown = optimistic ?? value;

  const toggle = async () => {
    const next = !shown;
    setOptimistic(next);
    try {
      await onChange(next);
    } catch {
      showSnackbar("Failed to update timer setting.", "error");
    } finally {
      setOptimistic(null);
    }
  };

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}
    >
      <Switch
        value={shown}
        onValueChange={toggle}
        disabled={disabled}
        color={colors.primary}
        style={{ transform: [{ scale: 0.85 }] }}
      />
      <Text
        style={{
          flexShrink: 1,
          color: disabled ? colors.onSurfaceDisabled : colors.onSurface,
          fontSize: FONT.base,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export const TimerManagement = () => {
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
        label="Start timer automatically"
        value={defaultEnabled}
        onChange={(enabled) =>
          triggerUpdateTimerSettings({ patch: { defaultEnabled: enabled } })
        }
      />
      <ToggleSetting
        label="Timer notifications"
        value={notify}
        disabled={!defaultEnabled}
        onChange={(enabled) =>
          triggerUpdateTimerSettings({ patch: { notify: enabled } })
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
      <AlarmSoundSelect disabled={!defaultEnabled} />
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
