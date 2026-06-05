import { Ionicons } from "@expo/vector-icons";
import { Block, COLORS, Day, Exercise } from "@liftledger/shared";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  useBlock,
  useCurrentDay,
  useMe,
  useUpdateUserBlock,
} from "@liftledger/api-client";
import { ActionDialog, DialogAction } from "../../../components/ActionDialog";
import { EditExercise } from "./EditExercise";

interface Props {
  addExerciseIdx: number | undefined;
  onClose: () => void;
}

export const AddExerciseDialog = ({ addExerciseIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock, isMutating: addingExercise } =
    useUpdateUserBlock();
  const { exercises } = useCurrentDay();

  const curGym = useMemo(
    () => curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym || "",
    [curBlock],
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
  useEffect(
    () => setNewExercise(defaultNewExercise),
    [addExerciseIdx, defaultNewExercise],
  );

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

  const handleAddExercise = async () => {
    const updatedExercises = exercises.toSpliced(
      addExerciseIdx ?? exercises.length,
      0,
      newExercise,
    );
    try {
      await saveExercises(updatedExercises);
      onClose();
    } catch {
      // Save failed — keep the dialog open so the user can retry. The spinner
      // clears on its own via useUpdateUserBlock's isMutating.
    }
  };

  const editActions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.primary} />,
      onPress: onClose,
      variant: "primaryInverted",
      disabled: addingExercise,
    },
    {
      icon: addingExercise ? (
        <ActivityIndicator color="white" />
      ) : (
        <Ionicons name="save" size={24} color="white" />
      ),
      onPress: handleAddExercise,
      disabled:
        addingExercise ||
        newExercise.name === "" ||
        newExercise.apparatus === "" ||
        newExercise.weightType === "",
      variant: "primary",
    },
  ];

  if (addExerciseIdx === undefined) return null;

  return (
    <ActionDialog
      open
      onClose={onClose}
      title="Add Exercise"
      actions={editActions}
      saving={addingExercise}
    >
      <EditExercise newExercise={newExercise} setNewExercise={setNewExercise} />
    </ActionDialog>
  );
};
