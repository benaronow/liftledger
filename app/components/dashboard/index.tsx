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
} from "@/lib/features/user/userSlice";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { History } from "../history";
import { CreateBlock } from "../createBlock";
import { CompleteDay } from "../completeDay";

const useStyles = makeStyles()((theme) => ({
  superDuperContainer: {
    display: "flex",
    width: "100%",
    height: "calc(100dvh - 120px)",
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
    padding: "10px 10px 0px 10px",
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  horizontalDivider: {
    width: "100%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  entry: {
    display: "flex",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
  },
  name: {
    display: "flex",
    fontWeight: 600,
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
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
}));

const boxStyle = (theme: Theme) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  background: "white",
  outline: 0,
  border: "none",
  borderRadius: "25px 25px 25px 25px",
  padding: "0px 10px 10px 10px",
  width: "100%",
  maxWidth: `calc(${theme.breakpoints.values["sm"]}px - 20px)`,
  marginBottom: "10px",
  [theme.breakpoints.up("sm")]: {
    maxHeight: "100%",
    overflow: "scroll",
    boxShadow: "5px 5px 5px gray",
  },
  [theme.breakpoints.up("md")]: {
    maxHeight: "calc(100dvh - 70px)",
    overflow: "scroll",
  },
});

export const Dashboard = () => {
  const { classes } = useStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    dispatch(setCurWeek(undefined));
    dispatch(setCurDay(undefined));
    dispatch(setCurExercise(undefined));
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

  return (
    <div className={classes.superDuperContainer} style={noUserBackground}>
      <div className={classes.superContainer}>
        <div className={classes.container}>
          {session ? (
            <Box sx={boxStyle}>
              <span className={classes.title}>Current Training Block</span>
              <div className={classes.horizontalDivider} />
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
                    <span className={classes.value}>
                      {curUser.curBlock.name}
                    </span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Start Date: </span>
                    <span className={classes.value}>
                      {dayjs(curUser.curBlock.startDate).format("MM/DD/YYYY")}
                    </span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Length: </span>
                    <span className={classes.value}>{`${
                      curUser.curBlock.length
                    } week${curUser.curBlock.length > 1 ? "s" : ""}`}</span>
                  </div>
                  <div className={classes.horizontalDivider} />
                  <div className={classes.entry}>
                    <span className={classes.name}>Current Week: </span>
                    <span className={classes.value}>{`Week ${
                      curWeekIdx + 1
                    }`}</span>
                  </div>
                  <div className={classes.entry}>
                    <span className={classes.name}>Current Day: </span>
                    <span className={classes.value}>{`${curDayName}${
                      curDayGroupName ? ` (${curDayGroupName})` : ""
                    }`}</span>
                  </div>
                  <div className={classes.horizontalDivider}></div>
                  <button
                    className={`${classes.startDayButton} ${
                      curUser.curExercise && classes.startedDayButton
                    }`}
                    onClick={() =>
                      handleStartDay(curWeekIdx, curDayIdx, curExerciseIdx)
                    }
                  >
                    {`${
                      !curExerciseIdx || curExerciseIdx === 0
                        ? "Start"
                        : "Resume"
                    }: Week ${curWeekIdx + 1}, ${curDayName}`}
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
