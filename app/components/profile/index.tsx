"use client";

import { Avatar } from "@mui/material";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import { deleteUser } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import { RouteType } from "@/types";
import { useProfileStyles } from "./useProfileStyles";

export const Profile = () => {
  const { classes } = useProfileStyles();
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
    </div>
  );
};
