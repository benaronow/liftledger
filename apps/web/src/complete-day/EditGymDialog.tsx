import { FaSave } from "react-icons/fa";
import { useState } from "react";
import {
  getNewSetsFromLatest,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useUpdateUserBlock,
  useUserBlock,
} from "@liftledger/api-client";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useCompleteDay } from "./CompleteDayProvider";
import { IoArrowBack } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

export const EditGymDialog = () => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useUserBlock(curUser?._id, curUser?.curBlock);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { trigger: triggerUpdateUserBlock, isMutating: editingGym } =
    useUpdateUserBlock();
  const { editGymDialogOpen, setEditGymDialogOpen } = useCompleteDay();
  const [gymName, setGymName] = useState<string>(
    curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ?? "",
  );

  const handleEditGym = async (name: string) => {
    if (!curUser?._id || !curBlock) return;

    await triggerUpdateUserBlock({
      userId: curUser._id,
      block: {
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
    setEditGymDialogOpen(false);
  };

  const handleAddGym = async (name: string) => {
    if (curUser) {
      triggerUpdateUser({ ...curUser, gyms: [...(curUser.gyms || []), name] });
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
            canAddCustom
            placeholder="Please select a gym"
          />
        </ActionDialog>
      )}
    </>
  );
};
