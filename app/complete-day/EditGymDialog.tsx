import { FaSave } from "react-icons/fa";
import { useUser } from "../layoutProviders/UserProvider";
import { useState } from "react";
import { useBlock } from "../layoutProviders/BlockProvider";
import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { SearchableSelect } from "../components/SearchableSelect";
import { useCompletedExercises } from "../layoutProviders/CompletedExercisesProvider";
import { useCompleteDay } from "./CompleteDayProvider";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

export const EditGymDialog = () => {
  const { curUser, updateUser } = useUser();
  const { curBlock, updateBlock } = useBlock();
  const { getNewSetsFromLatest } = useCompletedExercises();
  const { editGymDialogOpen, setEditGymDialogOpen } = useCompleteDay();
  const [gymName, setGymName] = useState<string>(
    curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ?? "",
  );
  const [editingGym, setEditingGym] = useState(false);

  const handleEditGym = async (name: string) => {
    if (!curBlock) return;

    setEditingGym(true);
    await updateBlock({
      ...curBlock,
      weeks: curBlock.weeks.map((week, wIdx) =>
        wIdx === curBlock.curWeekIdx
          ? week.map((day, dIdx) =>
              dIdx === curBlock.curDayIdx
                ? {
                    ...day,
                    gym: name,
                    exercises: day.exercises.map((exercise) =>
                      exercise.sets.some((s) => s.completed)
                        ? exercise
                        : {
                            ...exercise,
                            gym: name,
                            sets: getNewSetsFromLatest({
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
    });

    setGymName("");
    setEditGymDialogOpen(false);
    setEditingGym(false);
  };

  const handleAddGym = async (name: string) => {
    if (curUser) {
      updateUser({ ...curUser, gyms: [...(curUser.gyms || []), name] });
    }
  };

  const editGymActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setEditGymDialogOpen(false),
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
          curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ||
        editingGym,
      variant: "primary",
    },
  ];

  return (
    <>
      {editGymDialogOpen && (
        <ActionDialog
          open={editGymDialogOpen}
          onClose={() => setEditGymDialogOpen(false)}
          title="Change Gym"
          actions={editGymActions}
        >
          <SearchableSelect
            label="Session Gym:"
            value={gymName}
            options={curUser?.gyms || []}
            onSelect={setGymName}
            onAddCustom={handleAddGym}
            placeholder="Please select a gym"
          />
        </ActionDialog>
      )}
    </>
  );
};
