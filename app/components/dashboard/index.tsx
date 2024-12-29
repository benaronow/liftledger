"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../providers/loginContext";
import { makeStyles } from "tss-react/mui";
import { Box } from "@mui/material";
import dayjs from "dayjs";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    width: "100%",
    textAlign: "center",
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
    fontSize: "15px",
    height: "35px",
  },
  disabledButton: {
    background: "#9ED7FF",
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
};

export const Dashboard = () => {
  const { classes } = useStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const router = useRouter();
  const currentWeek =
    curUser?.curBlock?.weeks.find((week) => !week.completed)?.number || 0;
  const currentDay =
    curUser?.curBlock?.weeks[currentWeek - 1]?.days.find(
      (day) => !day.completed
    )?.name || "Unavailable";

  useEffect(() => {
    if (session && attemptedLogin && !curUser) {
      router.push("/create-account");
    }
  }, [attemptedLogin]);

  const handleStartDay = () => {
    return null;
  };

  return (
    <div className={classes.container}>
      {session ? (
        <Box sx={boxStyle}>
          <span className={classes.title}>Current Training Block</span>
          <div className={classes.divider}></div>
          <div className={classes.entry}>
            <span className={classes.name}>Name: </span>
            <span className={classes.value}>
              {curUser?.curBlock ? curUser?.curBlock?.name : "Loading"}
            </span>
          </div>
          <div className={classes.entry}>
            <span className={classes.name}>Start Date: </span>
            <span className={classes.value}>
              {curUser?.curBlock
                ? dayjs(curUser?.curBlock?.startDate).format("MM-DD-YYYY")
                : "Loading"}
            </span>
          </div>
          <div className={classes.entry}>
            <span className={classes.name}>Length (weeks): </span>
            <span className={classes.value}>
              {curUser?.curBlock ? curUser?.curBlock?.length : "Loading"}
            </span>
          </div>
          <div className={classes.divider}></div>
          <div className={classes.entry}>
            <span className={classes.name}>Current Week: </span>
            <span className={classes.value}>
              {curUser?.curBlock ? currentWeek : "Loading"}
            </span>
          </div>
          <div className={classes.entry}>
            <span className={classes.name}>Current Day: </span>
            <span className={classes.value}>
              {curUser?.curBlock ? currentDay : "Loading"}
            </span>
          </div>
          <div className={classes.divider}></div>
          <button
            className={`${classes.startDayButton} ${
              !curUser && classes.disabledButton
            }`}
            onClick={handleStartDay}
            disabled={!curUser}
          >
            {`Start: ${
              !curUser ? "Loading" : `Week ${currentWeek}, ${currentDay}`
            }`}
          </button>
        </Box>
      ) : (
        <span>Create an account or log in to use LiftLedger!</span>
      )}
    </div>
  );
};
