import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useExerciseOptions,
  useMe,
  useRenameExercise,
} from "@liftledger/api-client";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../theme";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { AppTextInput } from "./inputs";
import { SelectSheet } from "./SelectSheet";

type Field = "name" | "equipment";
type Scope = "list" | "current" | "all";

interface Props {
  field: Field;
  open: boolean;
  onClose: () => void;
}

const COPY: Record<Field, { title: string; singular: string }> = {
  name: { title: "Edit exercises", singular: "exercise" },
  equipment: { title: "Edit equipment", singular: "equipment" },
};

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

export const ManageExerciseList = ({ field, open, onClose }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const {
    allExerciseNameOptions,
    allExerciseEquipmentOptions,
    addExerciseName,
    addExerciseEquipment,
    deleteExerciseName,
    deleteExerciseEquipment,
  } = useExerciseOptions();
  const { trigger: renameExercise } = useRenameExercise();

  const options =
    field === "name" ? allExerciseNameOptions : allExerciseEquipmentOptions;
  const addOption = field === "name" ? addExerciseName : addExerciseEquipment;
  const deleteOption =
    field === "name" ? deleteExerciseName : deleteExerciseEquipment;
  const { title, singular } = COPY[field];

  const [original, setOriginal] = useState<string>();
  const [value, setValue] = useState("");
  const [scope, setScope] = useState<Scope>("list");
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<string>();
  const [deleting, setDeleting] = useState(false);

  const startEdit = (item: string) => {
    setOriginal(item);
    setValue(item);
    setScope("list");
    setEditorError("");
  };

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
    if (!canSave || !curUser?._id || original === undefined) return;
    setSaving(true);
    setEditorError("");
    try {
      await renameExercise({
        userId: curUser._id,
        field,
        from: original,
        to: trimmed,
        scope,
      });
      setOriginal(undefined);
    } catch {
      setEditorError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (pendingDelete === undefined) return;
    setDeleting(true);
    try {
      await deleteOption(pendingDelete);
      setPendingDelete(undefined);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <SelectSheet
        open={open}
        onClose={onClose}
        title={title}
        options={options}
        canAddCustom
        onAddCustom={addOption}
        searchPlaceholder={`Search or add ${singular}...`}
        renderItemRight={(item) => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              mode="contained"
              icon="pencil"
              size={18}
              containerColor={colors.primary}
              iconColor={colors.onPrimary}
              style={{
                margin: 0,
                marginRight: SPACING.sm,
                borderRadius: RADIUS.sm,
              }}
              onPress={() => startEdit(item)}
            />
            <IconButton
              mode="contained"
              icon="trash-can-outline"
              size={18}
              containerColor={colors.error}
              iconColor={colors.onError}
              style={{ margin: 0, borderRadius: RADIUS.sm }}
              onPress={() => setPendingDelete(item)}
            />
          </View>
        )}
      />
      <ConfirmationDialog
        open={original !== undefined}
        onClose={() => setOriginal(undefined)}
        title={`Rename ${singular}`}
        action="Save"
        onConfirm={handleSave}
        confirming={saving}
        confirmationDisabled={!canSave}
      >
        <View style={{ gap: SPACING.md, width: "100%" }}>
          <AppTextInput
            label={field === "name" ? "Exercise name" : "Equipment"}
            value={value}
            onChangeText={setValue}
            autoFocus
            error={
              duplicate
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
                  borderColor: selected
                    ? colors.primary
                    : colors.surfaceVariant,
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
      <ConfirmationDialog
        open={pendingDelete !== undefined}
        onClose={() => setPendingDelete(undefined)}
        title={`Delete ${singular}?`}
        destructive
        action="Delete"
        onConfirm={handleDelete}
        confirming={deleting}
        description={
          pendingDelete
            ? `"${pendingDelete}" will be removed from your list. Saved workouts that already use it are kept.`
            : undefined
        }
      />
    </>
  );
};
