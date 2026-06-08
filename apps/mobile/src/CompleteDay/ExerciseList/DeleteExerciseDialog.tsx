import { Program, Day, Exercise } from "@liftledger/shared";
import { View } from "react-native";
import { Text, useTheme } from "../../paper";
import { useSnackbar } from "../../providers/SnackbarProvider";
import {
  useProgram,
  useCurrentDay,
  useMe,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { FONT, SPACING } from "../../theme";

interface Props {
  deletingIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({ deletingIdx, onClose }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram, isMutating: deletingExercise } =
    useUpdateUserProgram();
  const { exercises } = useCurrentDay();
  const { showSnackbar } = useSnackbar();

  const saveExercises = async (exercises: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;
    const newDays: Day[] = curProgram.weeks[curProgram.curWeekIdx].toSpliced(
      curProgram.curDayIdx,
      1,
      {
        ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
        exercises,
      },
    );
    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(curProgram.curWeekIdx, 1, newDays),
    };
    await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
  };

  const handleDeleteExercise = async () => {
    if (deletingIdx === undefined) return;
    const updated = exercises.filter(
      (_: Exercise, i: number) => i !== deletingIdx,
    );
    try {
      await saveExercises(updated);
    } catch {
      showSnackbar("Failed to delete exercise. Please try again.");
    } finally {
      onClose();
    }
  };

  if (deletingIdx === undefined) return null;

  return (
    <ConfirmationDialog
      open
      onClose={onClose}
      title="Remove Exercise"
      onConfirm={handleDeleteExercise}
      confirming={deletingExercise}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
          }}
        >
          Are you sure you want to remove this add-on exercise?
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
            fontWeight: "700",
          }}
        >
          This action cannot be undone.
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
