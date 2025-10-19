import { Day, Exercise, WeightType } from "@/app/types";
import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { GrPowerReset } from "react-icons/gr";
import { FaSave } from "react-icons/fa";
import { DeleteResetDialog } from "../../DeleteResetDialog";
import { useBlock } from "@/app/providers/BlockProvider";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#58585b",
    boxShadow: "0px 5px 10px #131314",
    width: "100%",
    marginBottom: "15px",
    padding: "5px",
    borderRadius: "5px",
  },
  title: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "20px",
    fontWeight: 600,
  },
  titleButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "35px",
    minWidth: "35px",
    color: "white",
    borderRadius: "5px",
    background: "#0096FF",
    fontSize: "20px",
    border: "none",
  },
  back: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
});

interface EditDayProps {
  editingDay: number;
  setEditingDay: (day: number) => void;
}

export const EditDay = ({
  editingDay,
  setEditingDay,
}: EditDayProps) => {
  const { classes } = useStyles();
  const { curBlock, templateBlock, setTemplateBlock } = useBlock();
  const editingWeekIdx = curBlock?.curWeekIdx ?? 0;
  const [isResetting, setIsResetting] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const shouldEditDay = (day: Day) => {
    return day.name === templateBlock.weeks[editingWeekIdx][editingDay].name;
  };

  const handleAddExercise = (idx: number) => {
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      sets: [
        {
          reps: 0,
          weight: 0,
          completed: false,
          note: "",
        },
      ],
      weightType: WeightType.Pounds,
    };

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: day.exercises.toSpliced(idx, 0, newExercise),
                  }
                : day
            )
          : week
      ),
    });
  };

  const handleRemoveExercise = () => {
    if (templateBlock.weeks[editingWeekIdx][editingDay].exercises.length > 1)
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, idx) =>
          idx === editingWeekIdx
            ? week.map((day) =>
                shouldEditDay(day) && deletingIdx !== undefined
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(deletingIdx, 1),
                    }
                  : day
              )
            : week
        ),
      });
  };

  const clearAllExercises = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day) =>
              shouldEditDay(day)
                ? {
                    ...day,
                    exercises: [
                      {
                        name: "",
                        apparatus: "",
                        sets: [
                          {
                            reps: 0,
                            weight: 0,
                            completed: false,
                            note: "",
                          },
                        ],
                        weightType: "",
                      },
                    ],
                  }
                : day
            )
          : week
      ),
    });
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.titleContainer}>
          <button
            className={classes.titleButton}
            onClick={() => setIsResetting(true)}
          >
            <GrPowerReset />
          </button>
          <span className={classes.title}>{`${
            curBlock ? "Edit" : "Add"
          } Exercises`}</span>
          <button
            className={classes.titleButton}
            onClick={() => setEditingDay(-1)}
          >
            <FaSave />
          </button>
        </div>
        {templateBlock.weeks[editingWeekIdx][editingDay].exercises.map(
          (exercise, idx) => (
            <React.Fragment key={idx}>
              <AddButton onClick={() => handleAddExercise(idx)} />
              <ExerciseInfo
                exercise={exercise}
                takenExercises={templateBlock.weeks[editingWeekIdx][
                  editingDay
                ].exercises.filter(
                  (e) =>
                    !(
                      e.name === exercise.name &&
                      e.apparatus === exercise.apparatus
                    )
                )}
                eIdx={idx}
                editingDay={editingDay}
                setDeletingIdx={setDeletingIdx}
              />
            </React.Fragment>
          )
        )}
        <AddButton
          onClick={() =>
            handleAddExercise(
              templateBlock.weeks[editingWeekIdx][editingDay].exercises.length
            )
          }
        />
      </div>
      <DeleteResetDialog
        onClose={() => {
          setIsResetting(false);
          setDeletingIdx(undefined);
        }}
        type="exercise"
        isResetting={isResetting}
        isDeleting={deletingIdx !== undefined}
        onReset={() => {
          clearAllExercises();
          setIsResetting(false);
        }}
        onDelete={() => {
          handleRemoveExercise();
          setDeletingIdx(undefined);
        }}
      />
    </>
  );
};
