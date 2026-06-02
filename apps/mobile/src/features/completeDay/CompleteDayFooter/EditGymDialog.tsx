import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  getNewSetsFromLatest,
  useBlock,
  useCompletedExercises,
  useMe,
  useUpdateUser,
  useUpdateUserBlock,
} from "@liftledger/api-client";
import { ActionDialog, DialogAction } from "../../../components/ActionDialog";
import { SearchableSelect } from "../../../components/SearchableSelect";

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

    try {
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
    } catch {
      // Save failed — keep the dialog open for retry; the spinner clears via
      // useUpdateUserBlock's isMutating.
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

  const editGymActions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.primary} />,
      onPress: onClose,
      variant: "primaryInverted",
      disabled: editingGym,
    },
    {
      icon: editingGym ? (
        <ActivityIndicator color="white" />
      ) : (
        <Ionicons name="save" size={24} color="white" />
      ),
      onPress: () => handleEditGym(gymName),
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
      open
      onClose={onClose}
      title="Change Gym"
      actions={editGymActions}
      saving={editingGym}
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
