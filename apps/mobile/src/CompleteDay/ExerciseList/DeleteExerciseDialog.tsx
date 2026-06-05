import { Ionicons } from "@expo/vector-icons";
import { Block, COLORS, Day, Exercise } from "@liftledger/shared";
import { ActivityIndicator, Text, View } from "react-native";
import {
  useBlock,
  useCurrentDay,
  useMe,
  useUpdateUserBlock,
} from "@liftledger/api-client";
import { ActionDialog, DialogAction } from "../../components/ActionDialog";
import { FONT, SPACING } from "../../theme";

interface Props {
  deletingIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({ deletingIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock, isMutating: deletingExercise } =
    useUpdateUserBlock();
  const { exercises } = useCurrentDay();

  const saveExercises = async (exercises: Exercise[]) => {
    if (!curUser?._id || !curBlock) return;
    const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
      curBlock.curDayIdx,
      1,
      {
        ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
        exercises,
      },
    );
    const newBlock: Block = {
      ...curBlock,
      weeks: curBlock.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
    };
    await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
  };

  const handleDeleteExercise = async () => {
    if (deletingIdx === undefined) return;
    const updated = exercises.filter(
      (_: Exercise, i: number) => i !== deletingIdx,
    );
    try {
      await saveExercises(updated);
      onClose();
    } catch {
      // Save failed — keep the dialog open for retry; the spinner clears via
      // useUpdateUserBlock's isMutating.
    }
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.danger} />,
      onPress: onClose,
      variant: "dangerInverted",
      disabled: deletingExercise,
    },
    {
      icon: deletingExercise ? (
        <ActivityIndicator color="white" />
      ) : (
        <Ionicons name="trash" size={24} color="white" />
      ),
      onPress: handleDeleteExercise,
      variant: "danger",
      disabled: deletingExercise,
    },
  ];

  if (deletingIdx === undefined) return null;

  return (
    <ActionDialog
      open
      onClose={onClose}
      title="Remove Exercise"
      actions={deleteActions}
      saving={deletingExercise}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: "white", fontSize: FONT.base }}>
          Are you sure you want to remove this add-on exercise?
        </Text>
        <Text style={{ color: "white", fontSize: FONT.base, fontWeight: "700" }}>This action cannot be undone.</Text>
      </View>
    </ActionDialog>
  );
};
