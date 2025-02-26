"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import { makeStyles } from "tss-react/mui";
import { Box, Theme, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCurDay,
  setCurExercise,
  setCurWeek,
  // setEditingBlock,
  // setTemplate,
} from "@/lib/features/user/userSlice";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { History } from "../history";
import { CreateBlock } from "../createBlock";
import { CompleteDay } from "../completeDay";
import { RouteType } from "@/types";

const useStyles = makeStyles()((theme) => ({
  superDuperContainer: {
    display: "flex",
    width: "100%",
    height: "calc(100dvh - 50px)",
    overflow: "scroll",
    outline: "none",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 50px)",
    },
  },
  superContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  entry: {
    display: "flex",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    color: "white",
    whiteSpace: "nowrap",
  },
  name: {
    display: "flex",
    fontWeight: 700,
    width: "75%",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  value: {
    display: "flex",
    width: "125%",
    justifyContent: "flex-end",
    textAlign: "right",
  },
  loginButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#0096FF",
    fontWeight: 600,
    transform: "translateY(calc(50dvh - 70px))",
    "&:hover": {
      cursor: "pointer",
    },
  },
  startDayButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#0096FF",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
  startedDayButton: {
    color: "#7dc9ff",
    "&:hover": {
      cursor: "default",
    },
  },
  editBlockButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#32CD32",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
}));

const boxStyle = (theme: Theme) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "center",
  outline: 0,
  width: "100%",
  maxWidth: `calc(${theme.breakpoints.values["sm"]}px - 20px)`,
  margin: "40px 0px 60px 0px",
  height: "calc(100dvh - 150px)",
  padding: "0px 50px 0px 50px",
});

export const Dashboard = () => {
  const { classes } = useStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.Progress);
  }, []);

  const curWeekIdx =
    curUser?.curBlock?.weeks.findIndex((week) => !week.completed) || 0;
  const curDayIdx =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.findIndex(
      (day) => !day.completed
    ) || 0;
  const curDayName =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.find((day) => !day.completed)
      ?.name || "Unavailable";
  const curDayGroupName =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.find((day) => !day.completed)
      ?.groupName || "";
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
    if (innerWidth && innerWidth < theme.breakpoints.values["sm"]) {
      router.push("/complete-day");
    }
  };

  const handleLogin = () => {
    router.push(`/auth/login`);
  };

  const noUserBackground = curUser ? {} : { background: "white" };

  // const getTemplateFromBlock = (block: Block, editing: boolean) => {
  //   return {
  //     name: block.name,
  //     startDate: block.startDate,
  //     length: block.length,
  //     weeks: editing
  //       ? block.weeks
  //       : [
  //           {
  //             number: 1,
  //             days: block.weeks[block.length - 1].days.map((day) => {
  //               return {
  //                 name: day.name,
  //                 hasGroup: day.hasGroup,
  //                 groupName: day.groupName,
  //                 exercises: day.exercises.map((exercise) => {
  //                   return {
  //                     name: exercise.name,
  //                     apparatus: exercise.apparatus,
  //                     sets: exercise.sets,
  //                     reps: exercise.reps,
  //                     weight: exercise.weight,
  //                     weightType: exercise.weightType,
  //                     unilateral: exercise.unilateral,
  //                     note: "",
  //                     completed: false,
  //                   };
  //                 }),
  //                 completed: false,
  //                 completedDate: undefined,
  //               };
  //             }),
  //             completed: false,
  //           },
  //         ],
  //     completed: false,
  //   };
  // };

  // const handleCreateFromTemplate = (block: Block) => {
  //   dispatch(setTemplate(getTemplateFromBlock(block, true)));
  //   dispatch(setEditingBlock(true));
  //   router.push("/create-block");
  // };

  return (
    <div className={classes.superDuperContainer} style={noUserBackground}>
      <div className={classes.superContainer}>
        <div className={classes.container}>
          {session ? (
            <Box sx={boxStyle}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "League+Spartan",
                    color: "white",
                    fontWeight: 900,
                    fontSize: "16px",
                    marginBottom: "5px",
                  }}
                >
                  Currently Completing:
                </span>
                <span
                  style={{
                    fontFamily: "League+Spartan",
                    color: "white",
                    fontWeight: 900,
                    fontSize: "24px",
                  }}
                >
                  {curUser?.curBlock?.name}
                </span>
              </div>
              {!curUser && <span className={classes.noBlockText}>Loading</span>}
              {curUser && (!curUser.curBlock || curUser.curBlock.completed) && (
                <span className={classes.noBlockText}>
                  Create a training block to get started!
                </span>
              )}
              {curUser?.curBlock && !curUser.curBlock.completed && (
                <>
                  <div className={classes.entry}>
                    <span className={classes.name}>Start Date:</span>
                    <span className={classes.value}>
                      {dayjs(curUser.curBlock.startDate).format("MM/DD/YYYY")}
                    </span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Block Length:</span>
                    <span className={classes.value}>{`${
                      curUser.curBlock.length
                    } week${curUser.curBlock.length > 1 ? "s" : ""}`}</span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Current Week:</span>
                    <span className={classes.value}>{`Week ${
                      curWeekIdx + 1
                    }`}</span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Current Day:</span>
                    <span className={classes.value}>{`${curDayName}`}</span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Current Group:</span>
                    <span className={classes.value}>{`${
                      curDayGroupName ? `${curDayGroupName}` : "None"
                    }`}</span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Total Weight Lifted:</span>
                    <span className={classes.value}>{`some value`}</span>
                  </div>
                  {/* <button
                      className={classes.editBlockButton}
                      onClick={() =>
                        curUser?.curBlock &&
                        handleCreateFromTemplate(curUser.curBlock)
                      }
                    >
                      Edit Block
                    </button> */}
                  <button
                    style={{
                      display: "flex",
                      width: "100%",
                      background: "#0096FF",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontFamily: "League+Spartan",
                      fontSize: "20px",
                      fontWeight: 600,
                      border: "solid white 5px",
                      borderRadius: "25px",
                      height: "60px",
                    }}
                    onClick={() =>
                      handleStartDay(curWeekIdx, curDayIdx, curExerciseIdx)
                    }
                  >
                    <span>{`${
                      !curExerciseIdx || curExerciseIdx === 0
                        ? "Start"
                        : "Resume"
                    } Workout`}</span>
                  </button>
                </>
              )}
            </Box>
          ) : (
            <button className={classes.loginButton} onClick={handleLogin}>
              Log in to get started
            </button>
          )}
        </div>
        {curUser &&
          innerWidth &&
          innerWidth > theme.breakpoints.values["sm"] &&
          innerWidth < theme.breakpoints.values["md"] && <History />}
      </div>
      {curUser && innerWidth && innerWidth > theme.breakpoints.values["sm"] && (
        <>
          {curUser?.curExercise === undefined ? (
            <CreateBlock />
          ) : (
            <CompleteDay />
          )}
        </>
      )}
      {curUser && innerWidth && innerWidth > theme.breakpoints.values["md"] && (
        <History />
      )}
    </div>
  );
};
