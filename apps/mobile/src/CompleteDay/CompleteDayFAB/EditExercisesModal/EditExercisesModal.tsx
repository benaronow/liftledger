import { Program, Day, Exercise } from "@liftledger/shared";
import { useMemo, useState } from "react";
import { Modal, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useProgram,
  useCurrentDay,
  useMe,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { AddRow } from "../../../components/AddRow";
import { Badge } from "../../../components/Badge";
import { Sheet } from "../../../components/Sheet";
import { IconButton, Surface, Text, useTheme } from "../../../paper";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { EditExercise } from "./EditExercise";

// The add/edit form opens as its own page sheet stacked over the list, rather
// than swapping the list sheet's content. `idx` is the insert position (add) or
// the exercise being repointed (edit).
type Editor = { type: "add"; idx: number } | { type: "edit"; idx: number };

interface Props {
  open: boolean;
  onClose: () => void;
}

// The day's edit pop-up: the exercise lineup with insert rows between entries to
// add an add-on exercise at any position, and an edit button to repoint an
// exercise's name / apparatus / weight type (until its sets are logged).
export const EditExercisesModal = ({ open, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram, isMutating: saving } =
    useUpdateUserProgram();
  const { exercises } = useCurrentDay();
  const { showSnackbar } = useSnackbar();

  const [editor, setEditor] = useState<Editor>();

  const curGym = useMemo(
    () =>
      curProgram?.weeks[curProgram.curWeekIdx][curProgram.curDayIdx].gym || "",
    [curProgram],
  );
  const defaultNewExercise: Exercise = useMemo(
    () => ({
      name: "",
      apparatus: "",
      gym: curGym,
      weightType: "",
      sets: [],
      addedOn: true,
    }),
    [curGym],
  );
  const [newExercise, setNewExercise] = useState<Exercise>(defaultNewExercise);

  const close = () => {
    setEditor(undefined);
    onClose();
  };

  const startAdd = (idx: number) => {
    setNewExercise(defaultNewExercise);
    setEditor({ type: "add", idx });
  };

  const startEdit = (idx: number) => {
    setNewExercise(exercises[idx]);
    setEditor({ type: "edit", idx });
  };

  const saveExercises = async (updated: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;
    const newDays: Day[] = curProgram.weeks[curProgram.curWeekIdx].toSpliced(
      curProgram.curDayIdx,
      1,
      {
        ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
        exercises: updated,
      },
    );
    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(curProgram.curWeekIdx, 1, newDays),
    };
    await triggerUpdateUserProgram({
      userId: curUser._id,
      program: newProgram,
    });
  };

  const handleSave = async () => {
    if (!editor) return;
    try {
      await saveExercises(
        editor.type === "add"
          ? exercises.toSpliced(editor.idx, 0, newExercise)
          : exercises.toSpliced(editor.idx, 1, newExercise),
      );
      setEditor(undefined);
    } catch {
      showSnackbar(
        editor.type === "add"
          ? "Failed to add exercise. Please try again."
          : "Failed to edit exercise. Please try again.",
      );
    }
  };

  const exerciseIncomplete =
    newExercise.name === "" ||
    newExercise.apparatus === "" ||
    newExercise.weightType === "";

  return (
    <Modal
      visible={open}
      onRequestClose={close}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <Sheet
        title="Edit Exercises"
        actions={[{ label: "Done", onPress: close }]}
      >
        <ScrollView
          contentContainerStyle={{
            padding: SPACING.lg,
            paddingBottom: insets.bottom + SPACING.lg,
            alignItems: "center",
          }}
        >
          {exercises.map((exercise, idx) => {
            // Repointing an exercise re-seeds its sets from the target's
            // history, so it's off the table once any set is logged.
            const started = exercise.sets.some(
              (set) => set.completed || set.skipped,
            );
            return (
              <View key={idx} style={{ width: "100%", alignItems: "center" }}>
                <AddRow onPress={() => startAdd(idx)} />
                <Surface
                  elevation={1}
                  style={{
                    width: "100%",
                    borderRadius: RADIUS.md,
                    marginBottom: SPACING.md,
                    backgroundColor: colors.container,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      minHeight: 50,
                      paddingVertical: SPACING.sm,
                      paddingLeft: SPACING.md,
                      paddingRight: SPACING.sm,
                    }}
                  >
                    <View style={{ flexShrink: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: colors.text,
                          fontWeight: "700",
                          fontSize: FONT.base,
                        }}
                      >
                        {exercise.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.textDisabled,
                          fontWeight: "600",
                          fontSize: FONT.sm,
                        }}
                      >
                        {exercise.apparatus}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: SPACING.sm,
                      }}
                    >
                      {exercise.addedOn && (
                        <Badge label="ADD-ON" background={colors.dark} />
                      )}
                      <IconButton
                        style={{ margin: 0 }}
                        icon="pencil"
                        mode="contained"
                        size={18}
                        containerColor={
                          started ? colors.primaryDisabled : colors.primary
                        }
                        iconColor={
                          started ? colors.textDisabled : colors.onPrimary
                        }
                        disabled={started}
                        onPress={() => startEdit(idx)}
                      />
                    </View>
                  </View>
                </Surface>
              </View>
            );
          })}
          <AddRow onPress={() => startAdd(exercises.length)} />
        </ScrollView>
      </Sheet>

      <Modal
        visible={!!editor}
        onRequestClose={() => setEditor(undefined)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <Sheet
          title={editor?.type === "edit" ? "Edit Exercise" : "Add Exercise"}
          actions={[
            {
              label: "Cancel",
              onPress: () => setEditor(undefined),
              disabled: saving,
              textColor: colors.danger,
            },
            {
              label: editor?.type === "edit" ? "Save" : "Add",
              onPress: handleSave,
              loading: saving,
              disabled: saving || exerciseIncomplete,
            },
          ]}
        >
          <View style={{ padding: SPACING.lg }}>
            <EditExercise
              newExercise={newExercise}
              setNewExercise={setNewExercise}
            />
          </View>
        </Sheet>
      </Modal>
    </Modal>
  );
};
