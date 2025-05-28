import { Block, Day, Exercise, WeightType } from "@/types";
import React from "react";
import { useSelector } from "react-redux";
import { selectEditingBlock } from "@/lib/features/user/userSlice";
import { PushButton } from "../../pushButton";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { ExerciseInfo } from "./ExerciseInfo";

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
  title: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "15px",
  },
  back: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
});

interface EditDayProps {
  block: Block;
  setBlock: (block: Block) => void;
  editingDay: number;
  setEditingDay: (day: number) => void;
}

export const EditDay = ({
  block,
  setBlock,
  editingDay,
  setEditingDay,
}: EditDayProps) => {
  const { classes } = useStyles();
  const editingBlock = useSelector(selectEditingBlock);
  const editingWeekIdx = editingBlock ? block.curWeekIdx || 0 : 0;

  const shouldEditDay = (day: Day) => {
    return day.name === block.weeks[editingWeekIdx][editingDay].name;
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

    setBlock({
      ...block,
      weeks: block.weeks.map((week, wIdx) =>
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

  return (
    <div className={classes.container}>
      <span className={classes.title}>{`${
        editingBlock ? "Edit" : "Add"
      } Exercises`}</span>
      {block.weeks[editingWeekIdx][editingDay].exercises.map(
        (exercise, idx) => (
          <React.Fragment key={idx}>
            <AddButton onClick={() => handleAddExercise(idx)} />
            <ExerciseInfo
              exercise={exercise}
              eIdx={idx}
              block={block}
              setBlock={setBlock}
              editingDay={editingDay}
            />
          </React.Fragment>
        )
      )}
      <AddButton
        onClick={() =>
          handleAddExercise(
            block.weeks[editingWeekIdx][editingDay].exercises.length
          )
        }
      />
      <PushButton height={40} width={70} onClick={() => setEditingDay(-1)}>
        <span className={classes.back}>Back</span>
      </PushButton>
    </div>
  );
};
