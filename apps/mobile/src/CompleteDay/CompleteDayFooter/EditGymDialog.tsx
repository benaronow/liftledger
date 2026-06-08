import { useState } from "react";
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
  const [gymName, setGymName] = useState<string>(
    curProgram?.weeks[curProgram.curWeekIdx][curProgram.curDayIdx].gym ?? "",
  );

  const handleEditGym = async (name: string) => {
    if (!curUser?._id || !curProgram) return;

    try {
      await triggerUpdateUserProgram({
        userId: curUser._id,
        program: {
          ...curProgram,
          weeks: curProgram.weeks.map((week, wIdx) =>
            wIdx === curProgram.curWeekIdx
              ? week.map((day, dIdx) =>
                  dIdx === curProgram.curDayIdx
                    ? {
                        ...day,
                        gym: name,
                        exercises: day.exercises.map((exercise) =>
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
                    : day,
                )
              : week,
          ),
        },
      });

      setGymName("");
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

  if (!open) return null;

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Change Gym"
      onConfirm={() => handleEditGym(gymName)}
      confirming={editingGym}
      confirmationDisabled={
        gymName === curProgram?.weeks[curProgram.curWeekIdx][curProgram.curDayIdx].gym
      }
    >
      <SearchableSelect
        label="Session Gym"
        value={gymName}
        options={curUser?.gyms || []}
        onSelect={setGymName}
        onAddCustom={handleAddGym}
        canAddCustom
        placeholder="Select a gym..."
      />
    </ConfirmationDialog>
  );
};
