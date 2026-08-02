import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useRenameExerciseName,
  useRenameEquipment,
  useRenameUnit,
  useRenameGym,
} from "@liftledger/api-client";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AppTextInput } from "../../../components/inputs";
import { FONT, RADIUS, SPACING } from "../../../theme";

export type OptionType = "name" | "equipment" | "unit" | "gym";

type Scope = "list" | "current" | "all";

const SCOPE_OPTIONS: { value: Scope; label: string; description: string }[] = [
  {
    value: "list",
    label: "Just the list",
    description: "Leave saved workouts unchanged",
  },
  {
    value: "current",
    label: "This program too",
    description: "Also rename it in your current program",
  },
  {
    value: "all",
    label: "All history too",
    description: "Rename it everywhere across your programs",
  },
];

interface Props {
  field: OptionType;
  singular: string;
  label: string;
  original: string | undefined;
  options: string[];
  onClose: () => void;
}

export const RenameOptionDialog = ({
  field,
  singular,
  label,
  original,
  options,
  onClose,
}: Props) => {
  const { colors } = useTheme();
  const { send: renameExerciseName } = useRenameExerciseName();
  const { send: renameEquipment } = useRenameEquipment();
  const { send: renameUnit } = useRenameUnit();
  const { send: renameGym } = useRenameGym();

  const renameByField: Record<
    OptionType,
    (arg: { from: string; to: string; scope: Scope }) => Promise<unknown>
  > = {
    name: renameExerciseName,
    equipment: renameEquipment,
    unit: renameUnit,
    gym: renameGym,
  };

  const [value, setValue] = useState("");
  const [scope, setScope] = useState<Scope>("list");
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (original === undefined) return;
    setValue(original);
    setScope("list");
    setEditorError("");
    setCommitted(false);
  }, [original]);

  const trimmed = value.trim();

  const duplicate = useMemo(
    () =>
      original !== undefined &&
      trimmed !== "" &&
      trimmed.toLowerCase() !== original.toLowerCase() &&
      options.some((o) => o.toLowerCase() === trimmed.toLowerCase()),
    [trimmed, original, options],
  );

  const canSave = trimmed !== "" && !duplicate && trimmed !== original;

  const handleSave = async () => {
    if (!canSave || original === undefined) return;
    setSaving(true);
    setEditorError("");
    setCommitted(true);
    try {
      await renameByField[field]({
        from: original,
        to: trimmed,
        scope,
      });
      onClose();
    } catch {
      setCommitted(false);
      setEditorError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ConfirmationDialog
      open={original !== undefined}
      onClose={onClose}
      title={`Rename ${singular}`}
      action="Save"
      onConfirm={handleSave}
      confirming={saving}
      confirmationDisabled={!canSave}
    >
      <View style={{ gap: SPACING.md, width: "100%" }}>
        <AppTextInput
          label={label}
          value={value}
          onChangeText={setValue}
          testID="rename-option-input"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          error={
            !committed && duplicate
              ? `"${trimmed}" already exists`
              : editorError !== ""
                ? editorError
                : undefined
          }
        />
        {SCOPE_OPTIONS.map((opt) => {
          const selected = scope === opt.value;

          return (
            <Pressable
              key={opt.value}
              testID={`rename-scope-${opt.value}`}
              onPress={() => setScope(opt.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.md,
                padding: SPACING.md,
                borderRadius: RADIUS.md,
                backgroundColor: selected
                  ? colors.primaryContainer
                  : colors.background,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.surfaceVariant,
              }}
            >
              <MaterialCommunityIcons
                name={selected ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={selected ? colors.primary : colors.onSurfaceDisabled}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.onSurface,
                    fontSize: FONT.base,
                    fontWeight: selected ? "700" : "500",
                  }}
                >
                  {opt.label}
                </Text>
                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontSize: FONT.sm,
                  }}
                >
                  {opt.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ConfirmationDialog>
  );
};
