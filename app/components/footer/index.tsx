"use client";

import { usePathname, useRouter } from "next/navigation";
import { makeStyles } from "tss-react/mui";
import {
  AddCircleOutline,
  History,
  HomeOutlined,
  InsightsRounded,
  PersonOutline,
} from "@mui/icons-material";
import { RouteType } from "@/types";
import { useContext } from "react";
import { LoginContext } from "../providers/loginContext";

const useStyles = makeStyles()({
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "white",
    height: "70px",
    zIndex: "10",
  },
  icon: {
    marginTop: "-15px",
    color: "#a3258c",
    fontSize: "40px",
  },
  historyIcon: {
    marginTop: "-15px",
    color: "#a3258c",
    fontSize: "38px",
  },
  addIcon: {
    marginTop: "-15px",
    color: "#a3258c",
    fontSize: "35px",
  },
});

export const Footer = () => {
  const { classes } = useStyles();
  const { curUser } = useContext(LoginContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleIconClick = (type: RouteType) => {
    if (curUser) router.push(type);
  };

  return (
    <>
      {pathname !== "/" && (
        <div className={classes.container}>
          <div onClick={() => handleIconClick(RouteType.Progress)}>
            <InsightsRounded className={classes.icon}></InsightsRounded>
          </div>
          <div onClick={() => handleIconClick(RouteType.History)}>
            <History className={classes.historyIcon}></History>
          </div>
          <div onClick={() => handleIconClick(RouteType.Home)}>
            <HomeOutlined className={classes.icon}></HomeOutlined>
          </div>
          <div onClick={() => handleIconClick(RouteType.Add)}>
            <AddCircleOutline className={classes.addIcon}></AddCircleOutline>
          </div>
          <div onClick={() => handleIconClick(RouteType.Profile)}>
            <PersonOutline className={classes.icon}></PersonOutline>
          </div>
        </div>
      )}
    </>
  );
};
