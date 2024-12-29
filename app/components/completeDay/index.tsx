"use client";

import { selectCurUser } from "@/lib/features/user/userSlice";
import { Box, Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
    fontSize: "15px",
    marginRight: "5px",
  },
  lbs: {
    marginLeft: "-5px",
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
  height: "120px",
  zIndex: 1,
};

const overlayBoxStyle = {
  background: "lightgray",
  outline: 0,
  borderRadius: "25px 25px 25px 25px",
  padding: "10px 10px 0px 10px",
  width: "100%",
  maxWidth: "400px",
  marginTop: "-120px",
  marginBottom: "10px",
  height: "120px",
  zIndex: 2,
  opacity: 0.7,
};

export const CompleteDay = () => {
  const { classes } = useStyles();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();

  useEffect(() => {
    if (curUser?.curWeek === undefined || curUser?.curDay === undefined) {
      router.push("/dashboard");
    }
  }, [curUser]);

  const exercises =
    curUser &&
    curUser.curBlock &&
    curUser.curWeek !== undefined &&
    curUser.curDay !== undefined
      ? curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay].exercises
      : [];

  const handleCompleteExercise = () => {
    return null;
  };

  return (
    <div className={classes.container}>
      {exercises?.map((exercise, idx) => (
        <div className={classes.container} key={idx}>
          <Box sx={boxStyle}>
            <div className={classes.entry}>
              <span
                className={classes.title}
              >{`${exercise.name} (${exercise.apparatus})`}</span>
            </div>
            <div className={classes.entry}>
              <span className={classes.entryName}>Sets: </span>
              <Input className={classes.input} />
              <span className={classes.entryName}>Reps: </span>
              <Input className={classes.input} />
              <span className={classes.entryName}>Weight: </span>
              <Input className={classes.input} />
              <span className={`${classes.entryName} ${classes.lbs}`}>lbs</span>
            </div>
            <div className={classes.entry}>
              <button
                className={classes.startDayButton}
                onClick={() => handleCompleteExercise}
              >
                Complete
              </button>
            </div>
          </Box>
          <Box sx={overlayBoxStyle} key={idx}></Box>
        </div>
      ))}
    </div>
  );
};
