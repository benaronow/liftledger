import { Program, Session, Exercise } from "@liftledger/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useProgram,
  useCurrentSession,
  useMe,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { AddRow } from "../../../components/AddRow";
import { Badge } from "../../../components/Badge";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { Sheet } from "../../../components/Sheet";
import {
  IconButton,
  Portal,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { EditExercise } from "./EditExercise";

const DURATION = 250;

type Editor = { type: "add"; idx: number } | { type: "edit"; idx: number };

interface Props {
  open: boolean;
  onClose: () => void;
}

export const EditExercisesModal = ({ open, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram, isMutating: saving } =
    useUpdateUserProgram();
  const { exercises } = useCurrentSession();
  const { showSnackbar } = useSnackbar();
  const { height: screenHeight } = useWindowDimensions();

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [editor, setEditor] = useState<Editor>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number>();

  const curGym = useMemo(
    () =>
      curProgram?.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx]
        .gym || "",
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
    setDeletingIdx(undefined);
    onClose();
  };

  // Slide the sheet up from the bottom (Portal-rendered, so it shares the app's
  // main window — a native pageSheet would force any TopSheet opened from inside
  // it into a nested native modal that XCUITest can't reliably traverse).
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
      close();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const startAdd = (idx: number) => {
    setNewExercise(defaultNewExercise);
    setEditor({ type: "add", idx });
    setEditorOpen(true);
  };

  const startEdit = (idx: number) => {
    setNewExercise(exercises[idx]);
    setEditor({ type: "edit", idx });
    setEditorOpen(true);
  };

  const saveExercises = async (updated: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;
    const newSessions: Session[] = curProgram.rotations[
      curProgram.curRotationIdx
    ].toSpliced(curProgram.curSessionIdx, 1, {
      ...curProgram.rotations[curProgram.curRotationIdx][
        curProgram.curSessionIdx
      ],
      exercises: updated,
    });
    const newProgram: Program = {
      ...curProgram,
      rotations: curProgram.rotations.toSpliced(
        curProgram.curRotationIdx,
        1,
        newSessions,
      ),
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
      setEditorOpen(false);
    } catch {
      showSnackbar(
        editor.type === "add"
          ? "Failed to add exercise. Please try again."
          : "Failed to edit exercise. Please try again.",
      );
    }
  };

  const handleDelete = async () => {
    if (deletingIdx === undefined) return;
    try {
      await saveExercises(exercises.toSpliced(deletingIdx, 1));
      setDeletingIdx(undefined);
    } catch {
      showSnackbar("Failed to delete exercise. Please try again.");
    }
  };

  const exerciseIncomplete =
    newExercise.name === "" ||
    newExercise.apparatus === "" ||
    newExercise.weightType === "";

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return mounted ? (
    <Portal>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: progress },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
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
              const started = exercise.sets.some(
                (set) => set.completed || set.skipped,
              );
              return (
                <View key={idx} style={{ width: "100%", alignItems: "center" }}>
                  <AddRow
                    onPress={() => startAdd(idx)}
                    accessibilityLabel={`insert-exercise-${idx}`}
                  />
                  <Surface
                    elevation={1}
                    style={{
                      width: "100%",
                      borderRadius: RADIUS.md,
                      marginBottom: SPACING.md,
                      backgroundColor: colors.background,
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
                            color: colors.onSurface,
                            fontWeight: "700",
                            fontSize: FONT.base,
                          }}
                        >
                          {exercise.name}
                        </Text>
                        <Text
                          style={{
                            color: colors.onSurfaceDisabled,
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
                          <Badge
                            label="ADD-ON"
                            background={colors.surfaceVariant}
                          />
                        )}
                        {exercise.addedOn && (
                          <IconButton
                            style={{ margin: 0 }}
                            icon="delete"
                            mode="contained"
                            size={18}
                            containerColor={
                              started ? colors.surfaceDisabled : colors.error
                            }
                            iconColor={
                              started
                                ? colors.onSurfaceDisabled
                                : colors.onError
                            }
                            disabled={started}
                            onPress={() => setDeletingIdx(idx)}
                            accessibilityLabel={`delete-exercise-${idx}`}
                          />
                        )}
                        <IconButton
                          style={{ margin: 0 }}
                          icon="pencil"
                          mode="contained"
                          size={18}
                          containerColor={
                            started ? colors.surfaceDisabled : colors.primary
                          }
                          iconColor={
                            started
                              ? colors.onSurfaceDisabled
                              : colors.onPrimary
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
            <AddRow
              onPress={() => startAdd(exercises.length)}
              accessibilityLabel={`insert-exercise-${exercises.length}`}
            />
          </ScrollView>
        </Sheet>
      </Animated.View>
      <ConfirmationDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editor?.type === "edit" ? "Edit Exercise" : "Add Exercise"}
        action={editor?.type === "edit" ? "Save" : "Add"}
        onConfirm={handleSave}
        confirming={saving}
        confirmationDisabled={exerciseIncomplete}
      >
        <EditExercise
          newExercise={newExercise}
          setNewExercise={setNewExercise}
        />
      </ConfirmationDialog>
      <ConfirmationDialog
        open={deletingIdx !== undefined}
        onClose={() => setDeletingIdx(undefined)}
        title="Delete Exercise"
        icon="alert"
        destructive
        onConfirm={handleDelete}
        confirming={saving}
        description="Are you sure you want to delete this exercise?"
        emphasis="This action cannot be undone."
      />
    </Portal>
  ) : null;
};
