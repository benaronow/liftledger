import { DialogAction, ActionDialog } from "@/components/ActionDialog";
import { EditExercise } from "./EditExercise";
import { useEffect, useMemo, useState } from "react";
import { Program, Session, Exercise } from "@liftledger/shared";
import {
  useCurrentSession,
  useMe,
  useUpdateUserProgram,
  useProgram,
} from "@liftledger/api-client";
import { FaSave } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

interface Props {
  addExerciseIdx: number | undefined;
  onClose: () => void;
}

export const AddExerciseDialog = ({ addExerciseIdx, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram, isMutating: addingExercise } =
    useUpdateUserProgram();
  const { exercises } = useCurrentSession();

  const curGym = useMemo(
    () => curProgram?.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx].gym || "",
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
  useEffect(
    () => setNewExercise(defaultNewExercise),
    [addExerciseIdx, defaultNewExercise],
  );

  const saveExercises = async (exercises: Exercise[]) => {
    if (!curUser?._id || !curProgram) return;
    const newSessions: Session[] = curProgram.rotations[curProgram.curRotationIdx].toSpliced(
      curProgram.curSessionIdx,
      1,
      {
        ...curProgram.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx],
        exercises,
      },
    );

    const newProgram: Program = {
      ...curProgram,
      rotations: curProgram?.rotations.toSpliced(curProgram.curRotationIdx, 1, newSessions),
    };

    await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
  };

  const handleAddExercise = async () => {
    const updatedExercises = exercises.toSpliced(
      addExerciseIdx ?? exercises.length,
      0,
      newExercise,
    );
    await saveExercises(updatedExercises);
    onClose();
  };

  const editActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
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

  if (addExerciseIdx === undefined) return null;

  return (
    <ActionDialog
      open={addExerciseIdx !== undefined}
      onClose={onClose}
      title="Add Exercise"
      actions={editActions}
    >
      <EditExercise newExercise={newExercise} setNewExercise={setNewExercise} />
    </ActionDialog>
  );
};
