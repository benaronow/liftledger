import { useEffect, useState } from "react";
import {
  getNewSetsFromLatest,
  useProgram,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { SearchableSelect } from "../../components/SearchableSelect";

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
  const currentGym =
    curProgram?.rotations[curProgram.curRotationIdx]?.[curProgram.curSessionIdx]?.gym ?? "";
  const [gymName, setGymName] = useState<string>(currentGym);

  // Re-sync to the session's gym each time the dialog opens. The component stays
  // mounted across opens, so the useState initializer only runs once — without
  // this, a reopen would show a stale (or empty, after a prior save) selection.
  useEffect(() => {
    if (open) setGymName(currentGym);
  }, [open, currentGym]);

  const handleEditGym = async (name: string) => {
    if (!curUser?._id || !curProgram) return;

    try {
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

      onClose();
    } catch {
      // Save failed — keep the dialog open for retry; the spinner clears via
      // useUpdateUserProgram's isMutating.
    }
  };

  const handleAddGym = async (name: string) => {
    if (curUser) {
      await triggerUpdateUser({
        ...curUser,
        gyms: [...(curUser.gyms || []), name],
      });
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Change Gym"
      icon="dumbbell"
      onConfirm={() => handleEditGym(gymName)}
      confirming={editingGym}
      confirmationDisabled={gymName === currentGym}
    >
      <SearchableSelect
        label="Session Gym"
        value={gymName}
        options={curUser?.gyms || []}
        onSelect={setGymName}
        onAddCustom={handleAddGym}
        canAddCustom
        placeholder="Enter or add a gym..."
      />
    </ConfirmationDialog>
  );
};
