import { getNewSetsFromLatest } from "@liftledger/shared";
import { useEffect, useState } from "react";
import {
  useProgram,
  useCompletedExercises,
  useMe,
  useAddGym,
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
  const { data: curProgram } = useProgram();
  const { data: completedExercises } = useCompletedExercises();
  const { send: addGym } = useAddGym();
  const { send: triggerUpdateUserProgram, isLoading: editingGym } =
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
    if (!curProgram) return;

    try {
      await triggerUpdateUserProgram({
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
                          exercise.workingSets.some((s) => s.completed)
                            ? exercise
                            : {
                                ...exercise,
                                gym: name,
                                workingSets: getNewSetsFromLatest(completedExercises, {
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
      // useUpdateUserProgram's isLoading.
    }
  };

  const handleAddGym = async (name: string) => {
    await addGym({ value: name });
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Change Gym"
      onConfirm={() => handleEditGym(gymName)}
      confirming={editingGym}
      confirmationDisabled={gymName === currentGym}
    >
      <SearchableSelect
        label="Session Gym"
        value={gymName}
        options={curUser?.options?.gyms || []}
        onSelect={setGymName}
        onAddCustom={handleAddGym}
        canAddCustom
        placeholder="Search or add gym..."
      />
    </ConfirmationDialog>
  );
};
