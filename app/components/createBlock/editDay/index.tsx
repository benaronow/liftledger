import { Block, Day, Exercise, WeightType } from "@/types";
import React from "react";
import { useSelector } from "react-redux";
import { selectEditingBlock } from "@/lib/features/user/userSlice";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { ExerciseInfo } from "./ExerciseInfo";
import { GrPowerReset } from "react-icons/gr";
import { FaSave } from "react-icons/fa";

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
      <div className={classes.titleContainer}>
        <button className={classes.titleButton} onClick={() => {}}>
          <GrPowerReset />
        </button>
        <span className={classes.title}>{`${
          editingBlock ? "Edit" : "Add"
        } Exercises`}</span>
        <button
          className={classes.titleButton}
          onClick={() => setEditingDay(-1)}
        >
          <FaSave />
        </button>
      </div>
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
    </div>
  );
};
