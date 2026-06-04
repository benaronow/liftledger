import { FaSave } from "react-icons/fa";
import { useState } from "react";
import {
  getNewSetsFromLatest,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useUpdateUserBlock,
  useBlock,
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
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUser } = useUpdateUser();
  const { trigger: triggerUpdateUserBlock, isMutating: editingGym } =
    useUpdateUserBlock();
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
          curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ||
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
