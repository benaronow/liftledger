import { FaSave } from "react-icons/fa";
import { useState } from "react";
import {
  getNewSetsFromLatest,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useUpdateUserProgram,
  useProgram,
} from "@liftledger/api-client";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const EditGymDialog = ({ open, onClose }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { trigger: triggerUpdateUserProgram, isMutating: editingGym } =
    useUpdateUserProgram();
  const [gymName, setGymName] = useState<string>(
    curProgram?.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx].gym ?? "",
  );

  const handleEditGym = async (name: string) => {
    if (!curUser?._id || !curProgram) return;

    await triggerUpdateUserProgram({
      userId: curUser._id,
      program: {
        ...curProgram,
        rotations: curProgram.rotations.map((rotation, wIdx) =>
          wIdx === curProgram.curRotationIdx
            ? rotation.map((session, dIdx) =>
                dIdx === curProgram.curSessionIdx
                  ? {
                      ...session,
                      gym: name,
                      exercises: session.exercises.map((exercise) =>
                        exercise.sets.some((s) => s.completed)
                          ? exercise
                          : {
                              ...exercise,
                              gym: name,
                              sets: getNewSetsFromLatest(completedExercises, {
                                ...exercise,
                                gym: name,
                              }),
                            },
                      ),
                    }
                  : session,
              )
            : rotation,
        ),
      },
    });

    setGymName("");
    onClose();
  };

  const handleAddGym = async (name: string) => {
    if (curUser) {
      triggerUpdateUser({ ...curUser, gyms: [...(curUser.gyms || []), name] });
    }
  };

  const editGymActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
      variant: "primaryInverted",
      disabled: editingGym,
    },
    {
      icon: editingGym ? (
        <Spinner animation="border" variant="light" />
      ) : (
        <FaSave fontSize={28} />
      ),
      onClick: () => handleEditGym(gymName),
      disabled:
        gymName ===
          curProgram?.rotations[curProgram.curRotationIdx][curProgram.curSessionIdx].gym ||
        editingGym,
      variant: "primary",
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Change Gym"
      actions={editGymActions}
    >
      <SearchableSelect
        label="Session Gym:"
        value={gymName}
        options={curUser?.gyms || []}
        onSelect={setGymName}
        onAddCustom={handleAddGym}
        canAddCustom
        placeholder="Please select a gym"
      />
    </ActionDialog>
  );
};
