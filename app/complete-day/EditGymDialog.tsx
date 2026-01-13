import { FaSave } from "react-icons/fa";
import { useUser } from "../providers/UserProvider";
import { useEffect, useState } from "react";
import { useBlock } from "../providers/BlockProvider";
import { ActionButton } from "../components/ActionButton";
import { GrFormAdd } from "react-icons/gr";
import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { LabeledInput } from "../components/LabeledInput";
import { Exercise } from "@/lib/types";
import { getNewSetsFromLatest } from "@/lib/blockUtils";

interface Props {
  open: boolean;
  onClose: () => void;
  setExercisesState: React.Dispatch<React.SetStateAction<Exercise[]>>;
}

export const EditGymDialog = ({ open, onClose, setExercisesState }: Props) => {
  const { curUser, updateUser } = useUser();
  const { curBlock, updateBlock } = useBlock();
  const [gymName, setGymName] = useState<string>(
    curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ?? ""
  );

  const [adding, setAdding] = useState<boolean>(false);
  const [addingGymName, setAddingGymName] = useState<string>("");

  useEffect(() => {
    setGymName(
      curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ?? ""
    );
  }, [curBlock]);

  useEffect(() => {
    setGymName(
      curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym ?? ""
    );
    setAdding(false);
    setAddingGymName("");
  }, [open]);

  const handleEditGym = (gymName: string) => {
    if (curBlock) {
      updateBlock({
        ...curBlock,
        weeks: curBlock.weeks.map((week, wIdx) =>
          wIdx === curBlock.curWeekIdx
            ? week.map((day, dIdx) =>
                dIdx === curBlock.curDayIdx
                  ? {
                      ...day,
                      gym: gymName,
                      exercises: day.exercises.map((exercise) =>
                        exercise.sets.some((s) => s.completed)
                          ? exercise
                          : {
                              ...exercise,
                              sets: getNewSetsFromLatest(curBlock, {
                                ...exercise,
                                gym: gymName,
                              }),
                              gym: gymName,
                            }
                      ),
                    }
                  : day
              )
            : week
        ),
      });
    }
    setGymName("");
    setExercisesState((prev) =>
      prev.map((exercise) =>
        exercise.sets.some((s) => s.completed)
          ? exercise
          : { ...exercise, gym: gymName }
      )
    );
    onClose();
  };

  const handleAddGym = () => {
    if (curUser) {
      updateUser({
        ...curUser,
        gyms: [...(curUser?.gyms || []), addingGymName],
      });
    }
    setAddingGymName("");
    setAdding(false);
    handleEditGym(addingGymName);
  };

  const editGymActions: DialogAction[] = [
    {
      icon: <FaSave fontSize={28} />,
      onClick: () => (adding ? handleAddGym() : handleEditGym(gymName)),
      disabled: adding
        ? addingGymName === "" || curUser?.gyms?.includes(addingGymName)
        : gymName ===
          curBlock?.weeks[curBlock.curWeekIdx][curBlock.curDayIdx].gym,
      variant: "primary",
    },
  ];

  return (
    <>
      {open && (
        <ActionDialog
          open={open}
          onClose={onClose}
          title="Change Gym"
          actions={editGymActions}
        >
          {adding ? (
            <LabeledInput
              label="Gym name"
              textValue={addingGymName}
              onChangeText={(e) => setAddingGymName(e.target.value)}
            ></LabeledInput>
          ) : (
            <LabeledInput
              label="Session Gym:"
              textValue={gymName}
              options={curUser?.gyms || []}
              onChangeSelect={(e) => setGymName(e.target.value)}
              trailing={
                <ActionButton
                  icon={<GrFormAdd style={{ fontSize: "50px" }} />}
                  onClick={() => {
                    setAdding(true);
                  }}
                  width={35}
                  className="ms-2"
                ></ActionButton>
              }
            />
          )}
        </ActionDialog>
      )}
    </>
  );
};
