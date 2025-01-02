import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import {
  blockOp,
  selectCurUser,
  setCurBlock,
  setCurDay,
  setCurExercise,
  setCurWeek,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { BlockOp, NumberChange } from "@/types";
import { Box, Input, Theme, useTheme } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 120px)",
    padding: "10px 10px 0px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      background: "lightgray",
      height: "calc(100dvh - 50px)",
      overflow: "visible",
    },
  },
  exerciseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "Gabarito",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  divider: {
    width: "105%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
  },
  descText: {
    fontFamily: "Gabarito",
    fontWeight: 600,
    fontSize: "10px",
    color: "gray",
  },
  entryTitle: {
    fontFamily: "Gabarito",
    fontSize: "16px",
    fontWeight: 600,
  },
  eName: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
    textWrap: "nowrap",
  },
  entry: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    marginBottom: "10px",
    textAlign: "center",
    justifyContent: "center",
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
  noteName: {
    fontFamily: "Gabarito",
    fontSize: "16px",
    fontWeight: 400,
    width: "50%",
  },
  noteInput: {
    width: "100%",
  },
  lbs: {
    marginLeft: "-5px",
  },
  completeExerciseButton: {
    border: "none",
    background: "transparent",
    fontFamily: "Gabarito",
    fontSize: "16px",
    color: "#0096FF",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

const boxStyle = (theme: Theme) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "white",
  outline: 0,
  border: "none",
  borderRadius: "25px 25px 25px 25px",
  padding: "0px 10px 0px 10px",
  width: "100%",
  maxWidth: `calc(${theme.breakpoints.values["sm"]}px - 20px)`,
  [theme.breakpoints.up("sm")]: {
    border: "solid",
    borderWidth: "5px",
    padding: "10px 10px 0px 10px",
  },
});

export const CompleteDay = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();
  const curRef = useRef<HTMLDivElement>(null);
  const exercises =
    curUser &&
    curUser.curBlock &&
    curUser.curWeek !== undefined &&
    curUser.curDay !== undefined
      ? curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay].exercises
      : [];
  useEffect(() => {
    if (!exercises.length) router.push("/dashboard");
  }, [exercises]);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const [exercisesState, setExercisesState] = useState(exercises);
  const height = innerWidth && innerWidth >= 380 ? "190px" : "210px";

  const exerciseBoxStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "white",
    outline: 0,
    border: "solid",
    borderColor: "lightgray",
    borderWidth: "3px",
    borderRadius: "25px 25px 25px 25px",
    padding: "10px 10px 0px 10px",
    width: "100%",
    height,
    zIndex: 1,
    scrollMarginTop: "10px",
  };

  const overlayBoxStyle = {
    background: "lightgray",
    outline: 0,
    borderRadius: "25px 25px 25px 25px",
    padding: "10px 10px 0px 10px",
    width: "100%",
    marginTop: `-${height}`,
    marginBottom: "10px",
    height: height,
    zIndex: 2,
    opacity: 0.7,
  };

  const underlayBoxStyle = {
    height: height,
    marginTop: `-${height}`,
    marginBottom: "10px",
    zIndex: 0,
  };

  useEffect(() => {
    if (curUser?.curWeek === undefined || curUser?.curDay === undefined) {
      router.push("/dashboard");
    }
  }, [curUser]);

  useEffect(() => {
    if (curRef.current && curUser?.curExercise)
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

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (curUser?.curExercise !== undefined) {
      const newExercise = {
        ...exercisesState[curUser?.curExercise],
        note: e.target.value,
      };
      setExercisesState(
        exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
      );
    }
  };

  const handleNext = (completedDay: boolean) => {
    if (
      curUser?.curBlock &&
      curUser.curWeek !== undefined &&
      curUser.curDay !== undefined &&
      curUser.curExercise !== undefined
    ) {
      if (!completedDay) dispatch(setCurExercise(curUser.curExercise + 1));
      const completeExercise = {
        ...exercisesState[curUser.curExercise],
        completed: true,
      };
      const newExercisesState = exercisesState.toSpliced(
        curUser.curExercise,
        1,
        completeExercise
      );
      setExercisesState(newExercisesState);
      const newDay = {
        ...curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay],
        exercises: newExercisesState,
        completed: completedDay,
        completedDate: new Date(),
      };
      const newDays = curUser.curBlock.weeks[curUser.curWeek].days.toSpliced(
        curUser.curDay,
        1,
        newDay
      );
      const completedWeek =
        completedDay && curUser.curDay === newDays.length - 1;
      const newWeek = {
        ...curUser.curBlock.weeks[curUser.curWeek],
        days: newDays,
        completed: completedWeek,
      };
      const newWeeks = curUser.curBlock.weeks.toSpliced(
        curUser.curWeek,
        1,
        newWeek
      );
      const completedBlock =
        completedWeek && curUser.curWeek === curUser.curBlock.length - 1;
      if (completedBlock) dispatch(setCurBlock(undefined));
      const block = {
        ...curUser.curBlock,
        weeks: newWeeks,
        completed: completedBlock,
      };
      dispatch(blockOp({ uid: curUser._id || "", block, type: BlockOp.Edit }));
    }
    if (completedDay) {
      router.push("/dashboard");
      dispatch(setCurWeek(undefined));
      dispatch(setCurDay(undefined));
      dispatch(setCurExercise(undefined));
    }
  };

  return (
    <div className={classes.container}>
      {((pathname === "/dashboard" &&
        innerWidth &&
        innerWidth > theme.breakpoints.values["sm"]) ||
        (pathname === "/complete-day" &&
          innerWidth &&
          innerWidth < theme.breakpoints.values["sm"])) && (
        <Box sx={boxStyle}>
          <span className={classes.title}>Complete Workout</span>
          <div className={classes.divider}></div>
          <div className={classes.entry}>
            <span className={classes.descText}>
              *Sets, reps, and weight are those specified when creating plan, or
              those from previous session if applicable.
            </span>
          </div>
          {exercises?.map((exercise, idx) => (
            <div className={classes.exerciseContainer} key={idx}>
              <Box
                sx={exerciseBoxStyle}
                ref={idx === curUser?.curExercise ? curRef : null}
              >
                <div className={classes.eName}>
                  <span className={classes.entryTitle}>{`${exercise.name} ${
                    innerWidth && innerWidth >= 380
                      ? `(${exercise.apparatus})`
                      : ""
                  }`}</span>
                  <span className={classes.entryTitle}>{`${
                    innerWidth && innerWidth < 380
                      ? `(${exercise.apparatus})`
                      : ""
                  }`}</span>
                </div>
                <div className={classes.entry}>
                  <span
                    className={classes.entryName}
                  >{`Previous session note: ${
                    curUser?.curWeek !== undefined && curUser.curWeek > 0
                      ? curUser?.curBlock?.weeks[curUser.curWeek - 1].days[
                          curUser?.curDay || 0
                        ].exercises[idx].note
                      : "N/A"
                  }`}</span>
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
                  <span className={`${classes.entryName} ${classes.lbs}`}>
                    lbs
                  </span>
                </div>
                <div className={classes.entry}>
                  <span className={classes.noteName}>Leave a note: </span>
                  <Input
                    className={`${classes.input} ${classes.noteInput}`}
                    value={exercisesState[idx].note}
                    onChange={handleNoteChange}
                  />
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
                  idx === curUser?.curExercise
                    ? underlayBoxStyle
                    : overlayBoxStyle
                }
              />
            </div>
          ))}
        </Box>
      )}
    </div>
  );
};
