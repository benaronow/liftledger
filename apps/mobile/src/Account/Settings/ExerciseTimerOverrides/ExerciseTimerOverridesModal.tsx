import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useMe, useTimerSettings } from "@liftledger/api-client";
import { Icon, Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { LoadingCheckbox } from "../../../components/LoadingCheckbox";
import { SelectSheet } from "../../../components/SelectSheet";
import { TimePicker } from "../../../components/TimePicker";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, RADIUS, SPACING } from "../../../theme";

const formatTime = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0")} : ${(totalSeconds % 60).toString().padStart(2, "0")}`;

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ExerciseTimerOverridesModal = ({ open, onClose }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { defaultTime, exerciseOverrides, setExerciseOverride } =
    useTimerSettings();
  const { showSnackbar } = useSnackbar();

  const [editingName, setEditingName] = useState<string>();
  const [draftTime, setDraftTime] = useState(defaultTime);
  const [saving, setSaving] = useState(false);
  const [togglingNames, setTogglingNames] = useState<Set<string>>(
    () => new Set(),
  );

  const exerciseNames = useMemo(
    () => [...(curUser?.exerciseNames ?? [])].sort(),
    [curUser?.exerciseNames],
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
      <SelectSheet
        open={open}
        onClose={onClose}
        title="Exercise Overrides"
        searchPlaceholder="Search exercise..."
        options={exerciseNames}
        extraData={[exerciseOverrides, togglingNames]}
        renderItemLeft={(name) => {
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
        renderItemRight={(name) => {
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
