import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTimerSettings } from "@liftledger/api-client";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AppTextInput } from "../../../components/inputs";
import { LoadingCheckbox } from "../../../components/LoadingCheckbox";
import { SectionCard } from "../../../components/SectionCard";
import { TimePicker } from "../../../components/TimePicker";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, SPACING } from "../../../theme";
import {
  ExerciseTimerOverridesModal,
  formatTime,
} from "./ExerciseTimerOverridesModal";

export const TimerManagement = () => {
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const { defaultEnabled, setDefaultEnabled, defaultTime, setDefaultTime } =
    useTimerSettings();

  const [editOpen, setEditOpen] = useState(false);
  const [draftTime, setDraftTime] = useState(defaultTime);
  const [saving, setSaving] = useState(false);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  const toggleEnabled = async () => {
    setTogglingEnabled(true);
    try {
      await setDefaultEnabled(!defaultEnabled);
    } catch {
      showSnackbar("Failed to update timer setting.", "error");
    } finally {
      setTogglingEnabled(false);
    }
  };

  const openEdit = () => {
    setDraftTime(defaultTime);
    setEditOpen(true);
  };

  const saveDefaultTime = async () => {
    setSaving(true);
    try {
      await setDefaultTime(draftTime);
      setEditOpen(false);
    } catch {
      showSnackbar("Failed to update default time.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Rest Timer">
      <TouchableRipple
        onPress={togglingEnabled ? undefined : toggleEnabled}
        borderless
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.xs,
            marginLeft: -6,
            marginVertical: -6,
          }}
        >
          <LoadingCheckbox
            status={defaultEnabled ? "checked" : "unchecked"}
            loading={togglingEnabled}
          />
          <Text style={{ color: colors.onSurface, fontSize: FONT.base }}>
            Start timer automatically after sets
          </Text>
        </View>
      </TouchableRipple>
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
