"use client";

import { Avatar } from "@mui/material";
import { useContext, useEffect } from "react";
import { UserContext } from "../../providers/UserProvider";
import { useRouter } from "next/navigation";
import { RouteType } from "@/app/types";
import { ScreenStateContext } from "@/app/providers/ScreenStateProvider";
import { Spinner } from "../spinner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { makeStyles } from "tss-react/mui";
import { PushButton } from "../pushButton";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
    padding: "65px 15px 85px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 60px)",
    },
  },
  head: {
    display: "flex",
    flexDirection: "column",
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "14px",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "5px",
    whiteSpace: "nowrap",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    justifyContent: "space-between",
    background: "#131314",
    margin: "15px 0px",
    borderRadius: "5px",
    padding: "10px",
    gap: "10px",
    border: "solid 5px #58585b",
    boxShadow: "0px 5px 10px #131314",
  },
  entry: {
    display: "flex",
    fontFamily: "League+Spartan",
    width: "100%",
    justifyContent: "space-between",
    fontSize: "14px",
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 700,
  },
  logOut: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
}));

export const Profile = () => {
  const { classes } = useStyles();
  const { session, curUser } = useContext(UserContext);
  const { isFetching, toggleScreenState } = useContext(ScreenStateContext);
  const router = useRouter();
  dayjs.extend(utc);

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

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <Avatar
          sx={{ height: "75px", width: "75px", marginRight: "20px" }}
          src={session?.user.picture}
        />
        <div className={classes.info}>
          <div className={classes.entry}>
            <span className={classes.title}>Name:</span>
            <span>
              {curUser
                ? `${curUser?.firstName} ${curUser?.lastName}`
                : "Unavailable"}
            </span>
          </div>
          <div className={classes.entry}>
            <span className={classes.title}>Email:</span>
            <span>{curUser ? curUser.email : "Unavailable"}</span>
          </div>
          <div className={classes.entry}>
            <span className={classes.title}>Birthday:</span>
            <span>
              {curUser
                ? `${dayjs(curUser.birthday).utc().format("MM/DD/YYYY")}`
                : "Unavailable"}
            </span>
          </div>
        </div>
        <PushButton height={40} width={90}>
          <span className={classes.logOut} onClick={handleLogout}>
            Log Out
          </span>
        </PushButton>
      </div>
    </div>
  );
};
