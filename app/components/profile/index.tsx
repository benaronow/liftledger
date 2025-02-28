"use client";

import { Avatar } from "@mui/material";
import { useContext, useEffect } from "react";
import { makeStyles } from "tss-react/mui";
import { LoginContext } from "../../providers/loginProvider";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import { deleteUser } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import { RouteType } from "@/types";
import { Overlay } from "../overlay";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 60px)",
    padding: "0px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 60px)",
    },
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
    width: "100%",
    justifyContent: "flex-start",
  },
  value: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-end",
  },
  actions: {
    display: "flex",
    width: "70%",
    justifyContent: "space-around",
  },
  accountButton: {
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
  deleteButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#FF0000",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export const Profile = () => {
  const { classes } = useStyles();
  const { session, curUser } = useContext(LoginContext);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.Home);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Progress);
  }, []);

  const handleLogout = () => {
    router.push(`/auth/logout`);
  };

  const handleDelete = () => {
    dispatch(deleteUser(session?.user.email || ""));
    handleLogout();
  };

  return (
    <div className={classes.container}>
      <Overlay />
      <>
        <span className={classes.title}>Profile</span>
        <div className={classes.horizontalDivider}></div>
        <Avatar
          sx={{ height: "75px", width: "75px", marginBottom: "10px" }}
          src={session?.user.picture}
        />
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
              ? dayjs(curUser.birthday).format("MM/DD/YYYY")
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
        <div className={classes.horizontalDivider} />
        <div className={`${classes.entry} ${classes.actions}`}>
          <button className={classes.accountButton} onClick={handleLogout}>
            Log out
          </button>
          <button className={classes.deleteButton} onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </>
    </div>
  );
};
