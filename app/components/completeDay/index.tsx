"use client";

import {
  blockOp,
  selectCurUser,
  setCurExercise,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { BlockOp, NumberChange } from "@/types";
import { Box, Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "Gabarito",
    fontSize: "16px",
    fontWeight: 600,
  },
  entry: {
    display: "flex",
    width: "100",
    alignItems: "center",
    marginBottom: "10px",
  },
  entryName: {
    fontFamily: "Gabarito",
    fontSize: "16px",
    fontWeight: 400,
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    width: "100%",
    paddingLeft: "5px",
    fontSize: "16px",
    marginRight: "5px",
  },
  lbs: {
    marginLeft: "-5px",
  },
  completeExerciseButton: {
    marginBottom: "10px",
    border: "none",
    borderRadius: "5px",
    background: "#0096FF",
    color: "white",
    fontFamily: "Gabarito",
    fontSize: "16px",
    height: "35px",
  },
});

const boxStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "white",
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderWidth: "5px",
  borderRadius: "25px 25px 25px 25px",
  padding: "10px 10px 0px 10px",
  width: "100%",
  maxWidth: "400px",
  height: "140px",
  zIndex: 1,
  scrollMarginTop: "10px",
};

const overlayBoxStyle = {
  background: "lightgray",
  outline: 0,
  borderRadius: "25px 25px 25px 25px",
  padding: "10px 10px 0px 10px",
  width: "100%",
  maxWidth: "400px",
  marginTop: "-140px",
  marginBottom: "10px",
  height: "140px",
  zIndex: 2,
  opacity: 0.7,
};

const underlayBoxStyle = {
  height: "140px",
  marginTop: "-140px",
  marginBottom: "10px",
  zIndex: 0,
};

export const CompleteDay = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const curRef = useRef<HTMLDivElement>(null);
  const exercises =
    curUser &&
    curUser.curBlock &&
    curUser.curWeek !== undefined &&
    curUser.curDay !== undefined
      ? curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay].exercises
      : [];
  const [exercisesState, setExercisesState] = useState(exercises);

  useEffect(() => {
    if (curUser?.curWeek === undefined || curUser?.curDay === undefined) {
      router.push("/dashboard");
    }
  }, [curUser]);

  useEffect(() => {
    if (curRef.current)
      curRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [curUser?.curExercise]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: NumberChange
  ) => {
    if (curUser?.curExercise !== undefined) {
      if (type === NumberChange.Sets) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          sets: parseInt(e.target.value) || 0,
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
      if (type === NumberChange.Reps) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          reps: [parseInt(e.target.value) || 0],
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
      if (type === NumberChange.Weight) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          weight: [parseInt(e.target.value) || 0],
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
    }
  };

  const handleNext = (finishedWorkout: boolean) => {
    if (
      curUser?.curExercise !== undefined &&
      curUser.curBlock &&
      curUser.curWeek !== undefined &&
      curUser.curDay !== undefined
    ) {
      dispatch(setCurExercise(finishedWorkout ? 0 : curUser.curExercise + 1));
      const newExercise = {
        ...exercisesState[curUser.curExercise],
        completed: true,
      };
      const newExercisesState = exercisesState.toSpliced(
        curUser.curExercise,
        1,
        newExercise
      );
      setExercisesState(newExercisesState);
      const newDay = {
        ...curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay],
        exercises: newExercisesState,
        completed: finishedWorkout,
      };
      const newDays = curUser.curBlock.weeks[curUser.curWeek].days.toSpliced(
        curUser.curDay,
        1,
        newDay
      );
      const finishedWeek = curUser.curDay === newDays.length - 1;
      const newWeek = {
        ...curUser.curBlock.weeks[curUser.curWeek],
        days: newDays,
        completed: finishedWeek,
      };
      const newWeeks = curUser.curBlock.weeks.toSpliced(
        curUser.curWeek,
        1,
        newWeek
      );
      const finishedBlock = curUser.curWeek === newWeeks.length - 1;
      const block = {
        ...curUser.curBlock,
        weeks: newWeeks,
        completed: finishedBlock,
      };
      dispatch(
        blockOp({ uid: curUser._id || "", block, type: finishedWeek ? BlockOp.AddWeek : BlockOp.EditWeek })
      );
    }
  };

  return (
    <div className={classes.container}>
      {exercises?.map((exercise, idx) => (
        <div className={classes.container} key={idx}>
          <Box sx={boxStyle} ref={idx === curUser?.curExercise ? curRef : null}>
            <div className={classes.entry}>
              <span
                className={classes.title}
              >{`${exercise.name} (${exercise.apparatus})`}</span>
            </div>
            <div className={classes.entry}>
              <span className={classes.entryName}>Sets: </span>
              <Input
                className={classes.input}
                value={exercisesState[idx].sets}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, NumberChange.Sets)
                }
              />
              <span className={classes.entryName}>Reps: </span>
              <Input
                className={classes.input}
                value={exercisesState[idx].reps}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, NumberChange.Reps)
                }
              />
              <span className={classes.entryName}>Weight: </span>
              <Input
                className={classes.input}
                value={exercisesState[idx].weight}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(e, NumberChange.Weight)
                }
              />
              <span className={`${classes.entryName} ${classes.lbs}`}>lbs</span>
            </div>
            <div className={classes.entry}>
              <button
                className={classes.completeExerciseButton}
                onClick={() => handleNext(idx === exercises.length - 1)}
              >
                {idx === exercises.length - 1
                  ? "Finish Workout"
                  : "Next Exercise"}
              </button>
            </div>
          </Box>
          <Box
            sx={
              idx === curUser?.curExercise ? underlayBoxStyle : overlayBoxStyle
            }
          />
        </div>
      ))}
    </div>
  );
};
