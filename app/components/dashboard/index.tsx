"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../providers/loginContext";
import { makeStyles } from "tss-react/mui";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCurDay,
  setCurExercise,
  setCurWeek,
} from "@/lib/features/user/userSlice";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    transform: "translateY(25px)",
  },
  containerExtra: {
    transform: "translateY(50px)",
  },
  title: {
    fontFamily: "Gabarito",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  divider: {
    width: "100%",
    height: "1.5px",
    background: "black",
    marginBottom: "10px",
  },
  entry: {
    display: "flex",
    fontFamily: "Gabarito",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
  },
  name: {
    display: "flex",
    fontWeight: 600,
    width: "100%",
    justifyContent: "flex-start",
  },
  value: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
  },
  actions: {
    justifyContent: "space-around",
  },
  action: {
    fontWeight: 600,
  },
  accountButton: {
    border: "none",
    background: "transparent",
    fontFamily: "Gabarito",
    fontSize: "16px",
    color: "#0096FF",
    transform: "translateY(calc(50vh - 70px))",
  },
  deleteButton: {
    color: "#FF0000",
  },
  startDayButton: {
    marginBottom: "10px",
    border: "none",
    borderRadius: "5px",
    background: "#0096FF",
    color: "white",
    fontFamily: "Gabarito",
    fontSize: "16px",
    height: "35px",
  },
  disabledButton: {
    background: "#9ED7FF",
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "Gabarito",
    fontSize: "16px",
  },
  completedBlockEntry: {
    justifyContent: "center",
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
  marginBottom: "10px",
};

export const Dashboard = () => {
  const { classes } = useStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const curWeekIdx =
    curUser?.curBlock?.weeks.findIndex((week) => !week.completed) || 0;
  const curDayIdx =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.findIndex(
      (day) => !day.completed
    ) || 0;
  const curDayName =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.find((day) => !day.completed)
      ?.name || "Unavailable";
  const curExerciseIdx =
    curUser?.curBlock?.weeks[curWeekIdx]?.days[curDayIdx].exercises.findIndex(
      (exercise) => !exercise.completed
    ) || 0;

  useEffect(() => {
    if (session && attemptedLogin && !curUser) {
      router.push("/create-account");
    }
  }, [attemptedLogin]);

  const handleStartDay = (cwIDx: number, cdIdx: number, ceIdx: number) => {
    dispatch(setCurWeek(cwIDx));
    dispatch(setCurDay(cdIdx));
    dispatch(setCurExercise(ceIdx));
    router.push("/complete-day");
  };

  const handleLogin = () => {
    router.push(`/auth/login`);
  };

  const completedBlocks = curUser?.blocks.map((block, idx) => {
    if (block.completed)
      return (
        <div
          key={idx}
          className={`${classes.entry} ${classes.completedBlockEntry}`}
        >
          <span>{`${block.name}: Started ${dayjs(block.startDate).format(
            "MM-DD-YYYY"
          )}, ${block.length} weeks`}</span>
        </div>
      );
  });

  return (
    <div
      className={`${classes.container} ${!curUser && classes.containerExtra}`}
    >
      {curUser ? (
        <div className={classes.container}>
          <Box sx={boxStyle}>
            <span className={classes.title}>Current Training Block</span>
            <div className={classes.divider} />
            {!curUser && <span className={classes.noBlockText}>Loading</span>}
            {curUser && (!curUser.curBlock || curUser.curBlock.completed) && (
              <span className={classes.noBlockText}>
                Create a training block to get started!
              </span>
            )}
            {curUser?.curBlock && !curUser.curBlock.completed && (
              <>
                <div className={classes.entry}>
                  <span className={classes.name}>Name: </span>
                  <span className={classes.value}>{curUser.curBlock.name}</span>
                </div>
                <div className={classes.entry}>
                  <span className={classes.name}>Start Date: </span>
                  <span className={classes.value}>
                    {dayjs(curUser.curBlock.startDate).format("MM-DD-YYYY")}
                  </span>
                </div>
                <div className={classes.entry}>
                  <span className={classes.name}>Length: </span>
                  <span
                    className={classes.value}
                  >{`${curUser.curBlock.length} weeks`}</span>
                </div>
                <div className={classes.divider} />
                <div className={classes.entry}>
                  <span className={classes.name}>Current Week: </span>
                  <span className={classes.value}>{`Week ${
                    curWeekIdx + 1
                  }`}</span>
                </div>
                <div className={classes.entry}>
                  <span className={classes.name}>Current Day: </span>
                  <span className={classes.value}>{curDayName}</span>
                </div>
                <div className={classes.divider}></div>
                <button
                  className={classes.startDayButton}
                  onClick={() =>
                    handleStartDay(curWeekIdx, curDayIdx, curExerciseIdx)
                  }
                >
                  {`${
                    !curExerciseIdx || curExerciseIdx === 0 ? "Start" : "Resume"
                  }: Week ${curWeekIdx + 1}, ${curDayName}`}
                </button>
              </>
            )}
          </Box>
          <Box sx={boxStyle}>
            <span className={classes.title}>Completed Training Blocks</span>
            <div className={classes.divider} />
            {!curUser && <span className={classes.noBlockText}>Loading</span>}
            {curUser &&
              (completedBlocks && completedBlocks[0] ? (
                completedBlocks
              ) : (
                <div
                  className={`${classes.entry} ${classes.completedBlockEntry}`}
                >
                  <span>No completed blocks yet</span>
                </div>
              ))}
          </Box>
        </div>
      ) : (
        <button className={classes.accountButton} onClick={handleLogin}>
          Log in to get started
        </button>
      )}
    </div>
  );
};
