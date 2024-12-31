"use client";

import { Box } from "@mui/material";
import { useContext } from "react";
import { makeStyles } from "tss-react/mui";
import { LoginContext } from "../providers/loginContext";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import { deleteUser } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
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
  },
  deleteButton: {
    color: "#FF0000",
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

export const Profile = () => {
  const { classes } = useStyles();
  const { session, curUser } = useContext(LoginContext);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    router.push(`/auth/logout`);
  };

  const handleDelete = () => {
    dispatch(deleteUser(session?.user.email || ""));
    handleLogout();
  };

  return (
    <div className={classes.container}>
      <Box sx={boxStyle}>
        <span className={classes.title}>Profile</span>
        <div className={classes.divider}></div>
        <div className={classes.entry}>
          <span className={classes.name}>Name: </span>
          <span className={classes.value}>
            {curUser
              ? `${curUser?.firstName} ${curUser?.lastName}`
              : "Unavailable"}
          </span>
        </div>
        <div className={classes.entry}>
          <span className={classes.name}>Email: </span>
          <span className={classes.value}>
            {curUser ? curUser.email : "Unavailable"}
          </span>
        </div>
        <div className={classes.entry}>
          <span className={classes.name}>Birthday: </span>
          <span className={classes.value}>
            {curUser
              ? dayjs(curUser.birthday).format("MM-DD-YYYY")
              : "Unavailable"}
          </span>
        </div>
        <div className={classes.entry}>
          <span className={classes.name}>Max Bench Press: </span>
          <span className={classes.value}>
            {curUser ? curUser.benchMax : "Unavailable"}
          </span>
        </div>
        <div className={classes.entry}>
          <span className={classes.name}>Max Squat: </span>
          <span className={classes.value}>
            {curUser ? curUser.squatMax : "Unavailable"}
          </span>
        </div>
        <div className={classes.entry}>
          <span className={classes.name}>Max Deadlift: </span>
          <span className={classes.value}>
            {curUser ? curUser.deadMax : "Unavailable"}
          </span>
        </div>
        <div className={classes.divider}></div>
        <div className={`${classes.entry} ${classes.actions}`}>
          <button className={classes.accountButton} onClick={handleLogout}>
            Log out
          </button>
          <button
            className={`${classes.accountButton} ${classes.deleteButton}`}
            onClick={handleDelete}
          >
            Delete Account
          </button>
        </div>
      </Box>
    </div>
  );
};
