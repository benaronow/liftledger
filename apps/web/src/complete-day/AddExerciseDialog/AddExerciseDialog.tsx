import { DialogAction, ActionDialog } from "@/components/ActionDialog";
import { EditExercise } from "./EditExercise";
import { useEffect, useMemo, useState } from "react";
import { Block, Day, Exercise } from "@/lib/types";
import {
  useMe,
  useUpdateUserBlock,
  useUserBlock,
} from "@liftledger/api-client";
import { FaSave } from "react-icons/fa";
import { useCompleteDay } from "../CompleteDayProvider";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

export const AddExerciseDialog = () => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useUserBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock, isMutating: addingExercise } =
    useUpdateUserBlock();
  const { addExerciseIdx, setAddExerciseIdx, exercises } = useCompleteDay();

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
      weeks: curBlock?.weeks.toSpliced(curBlock.curWeekIdx, 1, newDays),
    };

    await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
  };

  const handleAddExercise = async () => {
    const updatedExercises = exercises.toSpliced(
      addExerciseIdx ?? exercises.length,
      0,
      newExercise,
    );
    await saveExercises(updatedExercises);
    setAddExerciseIdx(undefined);
  };

  const editActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setAddExerciseIdx(undefined),
      variant: "primaryInverted",
      disabled: addingExercise,
    },
    {
      icon: addingExercise ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave fontSize={28} />
      ),
      onClick: handleAddExercise,
      disabled:
        addingExercise ||
        newExercise.name === "" ||
        newExercise.apparatus === "" ||
        newExercise.weightType === "",
      variant: "primary",
    },
  ];

  return (
    <>
      {addExerciseIdx !== undefined && (
        <ActionDialog
          open={addExerciseIdx !== undefined}
          onClose={() => setAddExerciseIdx(undefined)}
          title="Add Exercise"
          actions={editActions}
        >
          <EditExercise
            newExercise={newExercise}
            setNewExercise={setNewExercise}
          />
        </ActionDialog>
      )}
    </>
  );
};
