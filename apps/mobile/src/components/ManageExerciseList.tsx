import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useExerciseOptions,
  useMe,
  useRenameExercise,
} from "@liftledger/api-client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, List, Portal, Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../theme";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { AppTextInput } from "./inputs";
import { Sheet } from "./Sheet";

type Field = "name" | "equipment";
type Scope = "list" | "current" | "all";

interface Props {
  field: Field;
  open: boolean;
  onClose: () => void;
}

const DURATION = 250;

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
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
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

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  const [editor, setEditor] = useState<{ original: string }>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [value, setValue] = useState("");
  const [scope, setScope] = useState<Scope>("list");
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");

  const [pendingDelete, setPendingDelete] = useState<string>();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const startAdd = () => {
    setEditor({ original: "" });
    setValue("");
    setScope("list");
    setEditorError("");
    setEditorOpen(true);
  };

  const startEdit = (item: string) => {
    setEditor({ original: item });
    setValue(item);
    setScope("list");
    setEditorError("");
    setEditorOpen(true);
  };

  const isAdding = editor?.original === "";
  const original = editor?.original ?? "";
  const trimmed = value.trim();

  const duplicate = useMemo(
    () =>
      trimmed !== "" &&
      trimmed.toLowerCase() !== original.toLowerCase() &&
      options.some((o) => o.toLowerCase() === trimmed.toLowerCase()),
    [trimmed, original, options],
  );

  const canSave =
    trimmed !== "" && !duplicate && (isAdding || trimmed !== original);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setEditorError("");
    try {
      if (isAdding) {
        await addOption(trimmed);
      } else if (curUser?._id) {
        await renameExercise({
          userId: curUser._id,
          field,
          from: original,
          to: trimmed,
          scope,
        });
      }
      setEditorOpen(false);
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

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  if (!mounted) return null;

  return (
    <Portal>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: progress },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.primaryContainer,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          overflow: "hidden",
          transform: [{ translateY }],
        }}
      >
        <Sheet title={title} actions={[{ label: "Done", onPress: onClose }]}>
          <FlatList
            style={{ flex: 1 }}
            data={options}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: insets.bottom + SPACING.md,
            }}
            ListHeaderComponent={
              <Pressable
                onPress={startAdd}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.sm,
                  paddingVertical: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={22}
                  color={colors.primary}
                />
                <Text style={{ color: colors.primary, fontSize: FONT.base }}>
                  Add {singular}
                </Text>
              </Pressable>
            }
            renderItem={({ item }) => (
              <List.Item
                title={item}
                titleStyle={{ color: colors.onSurface }}
                style={{ backgroundColor: colors.primaryContainer }}
                onPress={() => startEdit(item)}
                right={() => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      iconColor={colors.onSurfaceVariant}
                      onPress={() => startEdit(item)}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={20}
                      iconColor={colors.error}
                      onPress={() => setPendingDelete(item)}
                    />
                  </View>
                )}
              />
            )}
          />
        </Sheet>
      </Animated.View>
      <ConfirmationDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={isAdding ? `Add ${singular}` : `Rename ${singular}`}
        action={isAdding ? "Add" : "Save"}
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
          {!isAdding &&
            SCOPE_OPTIONS.map((opt) => {
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
        icon="alert"
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
    </Portal>
  );
};
