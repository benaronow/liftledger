"use client";

import { Avatar } from "@mui/material";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import { useAppDispatch } from "@/lib/hooks";
import { deleteUser } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import { RouteType } from "@/types";
import { useProfileStyles } from "./useProfileStyles";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { Spinner } from "../spinner";
import dayjs from "dayjs";

export const Profile = () => {
  const { classes } = useProfileStyles();
  const { session, curUser } = useContext(LoginContext);
  const { isFetching, toggleScreenState } = useContext(ScreenStateContext);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else if (!curUser) {
      router.push("/create-account");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Add);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.History);
      router.prefetch(RouteType.Progress);
    }
  }, []);

  const handleLogout = () => {
    router.push("/auth/logout");
  };

  const handleDelete = () => {
    dispatch(deleteUser(session?.user.email || ""));
    handleLogout();
  };

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div className={classes.container}>
      <div className={classes.box}>
        <div className={classes.head}>
          <Avatar
            sx={{ height: "75px", width: "75px", marginRight: "20px" }}
            src={session?.user.picture}
          />
          <div className={classes.info}>
            <div className={classes.entry}>
              <span>Name:</span>
              <span>
                {curUser
                  ? `${curUser?.firstName} ${curUser?.lastName}`
                  : "Unavailable"}
              </span>
            </div>
            <div className={classes.entry}>
              <span>Email:</span>
              <span>{curUser ? curUser.email : "Unavailable"}</span>
            </div>
            <div className={classes.entry}>
              <span>Birthday:</span>
              <span>
                {curUser
                  ? dayjs(curUser.birthday).format("MM/DD/YYYY")
                  : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
        <div className={classes.actions}>
          <div className={classes.buttonContainer}>
            <div
              className={`${classes.actionButton} ${classes.submitButtonBottom}`}
            />
            <button
              className={`${classes.actionButton} ${classes.submitButtonTop}`}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
          <div className={classes.buttonContainer}>
            <div
              className={`${classes.actionButton} ${classes.clearButtonBottom}`}
            />
            <button
              className={`${classes.actionButton} ${classes.clearButtonTop}`}
              onClick={handleDelete}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
