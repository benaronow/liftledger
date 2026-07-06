import { useState } from "react";
import { Pressable, View } from "react-native";
import { useTimerSettings } from "@liftledger/api-client";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { ExerciseNameSelect } from "../../../components/ExerciseNameSelect";
import { LoadingCheckbox } from "../../../components/LoadingCheckbox";
import { TimePicker } from "../../../components/TimePicker";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, RADIUS, SPACING } from "../../../theme";

export const formatTime = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0")} : ${(totalSeconds % 60).toString().padStart(2, "0")}`;

export const ExerciseTimerOverridesModal = () => {
  const { colors } = useTheme();
  const {
    defaultEnabled,
    defaultTime,
    exerciseOverrides,
    setExerciseOverride,
  } = useTimerSettings();
  const { showSnackbar } = useSnackbar();

  const [editingName, setEditingName] = useState<string>();
  const [draftTime, setDraftTime] = useState(defaultTime);
  const [saving, setSaving] = useState(false);
  const [togglingNames, setTogglingNames] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleOverride = async (name: string, currentlyOn: boolean) => {
    setTogglingNames((prev) => new Set(prev).add(name));
    try {
      await setExerciseOverride(name, currentlyOn ? undefined : defaultTime);
    } catch {
      showSnackbar("Failed to update override.", "error");
    } finally {
      setTogglingNames((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const startEdit = (name: string, current: number) => {
    setDraftTime(current);
    setEditingName(name);
  };

  const saveEdit = async () => {
    if (!editingName) return;
    setSaving(true);
    try {
      await setExerciseOverride(editingName, draftTime);
      setEditingName(undefined);
    } catch {
      showSnackbar("Failed to update override.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ExerciseNameSelect
        label="Exercise Overrides"
        value=""
        onSelect={() => {}}
        dismissOnSelect={false}
        renderTrigger={(open) => (
          <Button mode="contained" disabled={!defaultEnabled} onPress={open}>
            Exercise overrides
          </Button>
        )}
        prefix={(name) => {
          const enabled = exerciseOverrides[name] !== undefined;
          return (
            <View style={{ marginLeft: -6 }}>
              <LoadingCheckbox
                status={enabled ? "checked" : "unchecked"}
                loading={togglingNames.has(name)}
                onPress={() => toggleOverride(name, enabled)}
              />
            </View>
          );
        }}
        trailing={(name) => {
          const override = exerciseOverrides[name];
          const enabled = override !== undefined;
          const onEdit = enabled ? () => startEdit(name, override) : undefined;

          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={onEdit}
                style={{
                  height: 34,
                  justifyContent: "center",
                  backgroundColor: colors.surfaceVariant,
                  paddingHorizontal: SPACING.sm,
                  borderTopLeftRadius: RADIUS.sm,
                  borderBottomLeftRadius: RADIUS.sm,
                }}
              >
                <Text
                  style={{
                    color: enabled
                      ? colors.onSurface
                      : colors.onSurfaceDisabled,
                    fontWeight: "700",
                    fontSize: FONT.base,
                  }}
                >
                  {formatTime(enabled ? override : defaultTime)}
                </Text>
              </Pressable>
              <Pressable
                onPress={onEdit}
                style={{
                  height: 34,
                  width: 34,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: enabled
                    ? colors.primary
                    : colors.surfaceDisabled,
                  borderTopRightRadius: RADIUS.sm,
                  borderBottomRightRadius: RADIUS.sm,
                }}
              >
                <Icon
                  source="pencil"
                  size={18}
                  color={enabled ? colors.onPrimary : colors.onSurfaceDisabled}
                />
              </Pressable>
            </View>
          );
        }}
      />
      <ConfirmationDialog
        open={editingName !== undefined}
        onClose={() => setEditingName(undefined)}
        title="Override Rest Time"
        action="Save"
        onConfirm={saveEdit}
        confirming={saving}
      >
        <TimePicker totalSeconds={draftTime} onChange={setDraftTime} />
      </ConfirmationDialog>
    </>
  );
};
