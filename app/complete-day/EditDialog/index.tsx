import { Block, Day, Exercise, Set } from "@/lib/types";
import { Dispatch, SetStateAction, useState } from "react";
import { FaSave, FaTrash } from "react-icons/fa";
import { EditExercise } from "./EditExercise";
import { EditSet } from "./EditSet";
import { Action, ActionDialog } from "../../components/ActionDialog";
import { IoArrowBack } from "react-icons/io5";
import { makeStyles } from "tss-react/mui";
import { useBlock } from "@/app/providers/BlockProvider";

const useStyles = makeStyles()({
  deleteContainer: {
    display: "flex",
    flexDirection: "column",
  },
  deleteQuestion: {
    whiteSpace: "wrap",
    marginBottom: "20px",
  },
  deleteDisclaimer: {
    whiteSpace: "wrap",
    fontWeight: 900,
  },
});

interface Props {
  setIdx: number | undefined;
  exercise: Exercise;
  addIdx: number | undefined;
  setAddIdx: Dispatch<SetStateAction<number | undefined>>;
  exercisesState: Exercise[];
  setExercisesState: Dispatch<SetStateAction<Exercise[]>>;
  onClose: () => void;
}

export type ChangeExerciseType = "name" | "apparatus" | "weightType";
export type SubmitExerciseType = "change" | "add" | "delete";

export const EditDialog = ({
  setIdx,
  exercise,
  addIdx,
  setAddIdx,
  exercisesState,
  setExercisesState,
  onClose,
}: Props) => {
  const { classes } = useStyles();
  const { curBlock, editBlock } = useBlock();
  const exerciseIdx = exercisesState.findIndex(
    (e) => e.name === exercise.name && e.apparatus === exercise.apparatus
  );
  const [exerciseState, setExerciseState] = useState<Exercise>(
    setIdx === exercise.sets.length
      ? {
          ...exercise,
          sets: [
            ...exercise.sets,
            { ...exercise.sets[setIdx - 1], completed: false, note: "" },
          ],
        }
      : exercise
  );
  const [editingType, setEditingType] = useState<ChangeExerciseType | "">("");
  const [isDeleting, setIsDeleting] = useState(false);

  const saveExercises = (complete: Exercise[]) => {
    if (curBlock) {
      const newDays: Day[] = curBlock.weeks[curBlock.curWeekIdx].toSpliced(
        curBlock.curDayIdx,
        1,
        {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          exercises: complete,
        }
      );

      const updatedLaterDays: Day[] = newDays.map((day: Day, idx) =>
        idx <= curBlock.curDayIdx
          ? day
          : {
              ...day,
              exercises: day.exercises.map((exercise: Exercise) => {
                const completedExercise = complete.find(
                  (e: Exercise) =>
                    e.name === exercise.name &&
                    e.apparatus === exercise.apparatus
                );

                return completedExercise
                  ? {
                      ...completedExercise,
                      sets: completedExercise.sets.map((set: Set) => ({
                        ...set,
                        completed: false,
                        note: "",
                      })),
                    }
                  : exercise;
              }),
            }
      );

      const newBlock: Block = {
        ...curBlock,
        weeks: curBlock?.weeks.toSpliced(
          curBlock.curWeekIdx,
          1,
          updatedLaterDays
        ),
      };

      editBlock(newBlock);
    }
  };

  const handleSubmitSet = (deleteSetIdx?: number) => {
    if (setIdx !== undefined) {
      const updatedExercise: Exercise = {
        ...exerciseState,
        sets:
          deleteSetIdx === undefined
            ? exerciseState?.sets.toSpliced(setIdx, 1, {
                ...exerciseState.sets[setIdx],
                completed: true,
              })
            : exerciseState.sets.toSpliced(deleteSetIdx, 1),
      };

      const updatedExercises = exercisesState.toSpliced(
        exercisesState.findIndex(
          (e) =>
            e.name === updatedExercise.name &&
            e.apparatus === updatedExercise.apparatus
        ),
        1,
        updatedExercise
      );

      setExercisesState(updatedExercises);
      saveExercises(updatedExercises);
      onClose();
    }
  };

  const getExerciseToSubmit = (idx: number, submitType: SubmitExerciseType) => {
    switch (submitType) {
      case "change":
        return exercisesState.toSpliced(idx, 1, exerciseState);
      case "add":
        return exercisesState.toSpliced(idx, 0, exerciseState);
      case "delete":
        return exercisesState.toSpliced(idx, 1);
    }
  };

  const handleSubmitExercise = (submitType: SubmitExerciseType) => {
    const updatedExercises = getExerciseToSubmit(
      exerciseIdx >= 0 ? exerciseIdx : addIdx !== undefined ? addIdx : 0,
      submitType
    );
    setAddIdx(undefined);
    setExercisesState(updatedExercises);
    saveExercises(updatedExercises);
    onClose();
  };

  const editActions: Action[] = [
    {
      text: <FaSave />,
      enabledStyle: {
        background: "#0096FF",
        color: "white",
        fontSize: "28px",
      },
      disabledStyle: {
        background: "#317baf",
        color: "#a7a7a7",
        fontSize: "28px",
      },
      onClick: () =>
        setIdx !== undefined
          ? handleSubmitSet()
          : handleSubmitExercise(addIdx !== undefined ? "add" : "change"),
      disabled:
        exerciseState.name === "" ||
        exerciseState.apparatus === "" ||
        exerciseState.weightType === "",
    },
    {
      text: <FaTrash />,
      enabledStyle: {
        background: "#0096FF",
        color: "white",
        fontSize: "25px",
      },
      disabledStyle: {
        background: "#317baf",
        color: "#a7a7a7",
        fontSize: "25px",
      },
      onClick: () => setIsDeleting(true),
      disabled: editingType === "",
    },
  ];

  const deleteActions: Action[] = [
    {
      text: <IoArrowBack />,
      enabledStyle: {
        background: "white",
        color: "red",
        fontSize: "30px",
      },
      onClick: () => setIsDeleting(false),
    },
    {
      text: <FaTrash />,
      enabledStyle: {
        background: "red",
        color: "white",
        fontSize: "28px",
      },
      onClick: () =>
        setIdx !== undefined
          ? handleSubmitSet(setIdx)
          : handleSubmitExercise("delete"),
    },
  ];

  return (
    <ActionDialog
      open={!!exerciseState}
      onClose={onClose}
      title={`${isDeleting ? "Delete" : "Edit"} ${
        setIdx !== undefined ? "Set" : "Exercise"
      }`}
      actions={isDeleting ? deleteActions : editActions}
    >
      {isDeleting ? (
        <div className={classes.deleteContainer}>
          <span
            className={classes.deleteQuestion}
          >{`Are you sure you want to delete this ${
            setIdx !== undefined ? "set" : "exercise"
          }?`}</span>
          <span className={classes.deleteDisclaimer}>
            This action cannot be undone.
          </span>
        </div>
      ) : setIdx !== undefined ? (
        <EditSet
          setIdx={setIdx}
          exerciseState={exerciseState}
          exercisesState={exercisesState}
          setExerciseState={setExerciseState}
        />
      ) : (
        <EditExercise
          exerciseState={exerciseState}
          setExerciseState={setExerciseState}
          editingType={editingType}
          setEditingType={setEditingType}
          takenExercises={exercisesState.filter(
            (e) =>
              !(e.name === exercise.name && e.apparatus === exercise.apparatus)
          )}
        />
      )}
    </ActionDialog>
  );
};
