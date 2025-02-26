"use client";

import { usePathname } from "next/navigation";
import { makeStyles } from "tss-react/mui";
import {
  AddCircleOutline,
  History,
  HomeOutlined,
  InsightsRounded,
  PersonOutline,
} from "@mui/icons-material";
import { RouteType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { useTheme } from "@mui/material";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCurDay,
  setCurExercise,
  setCurWeek,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import Link from "next/link";

const useStyles = makeStyles()((theme) => ({
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "#a3258c",
    height: "70px",
    zIndex: 10,
    [theme.breakpoints.up("sm")]: {
      display: "none",
      zIndex: 0,
    },
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "50px",
    borderRadius: "25px",
    background: "#a3258c",
    transform: "translateY(-5px)",
  },
  homeIconContainer: {
    height: "65px",
    width: "65px",
    borderRadius: "32.5px",
    transform: "translateY(-12.5px)",
  },
  iconCircle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "40px",
    width: "40px",
    borderRadius: "20px",
    background: "white",
    "&:hover": {
      cursor: "pointer",
    },
  },
  homeIconCircle: {
    height: "55px",
    width: "55px",
    borderRadius: "27.5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  progressIcon: {
    color: "#a3258c",
    fontSize: "30px",
  },
  historyIcon: {
    color: "#a3258c",
    fontSize: "35px",
    marginRight: "2px",
  },
  homeIcon: {
    color: "#a3258c",
    fontSize: "50px",
  },
  addIcon: {
    color: "#a3258c",
    fontSize: "33px",
    marginTop: "1px",
  },
  profileIcon: {
    color: "#a3258c",
    fontSize: "35px",
  },
}));

export const Footer = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();

  const [isStandalone, setIsStandalone] = useState(true);
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleIconClick = () => {
    dispatch(setTemplate(undefined));
    dispatch(setEditingBlock(false));
    dispatch(setCurWeek(undefined));
    dispatch(setCurDay(undefined));
    dispatch(setCurExercise(undefined));
    console.log("ello mate");
  };

  return (
    <>
      {pathname !== "/" && (
        <div
          className={classes.container}
          style={{ transform: `translateY(${isStandalone ? "0px" : "10px"})` }}
        >
          {innerWidth && innerWidth < theme.breakpoints.values["sm"] && (
            <>
              <Link
                className={classes.iconContainer}
                href={RouteType.Progress}
                onClick={handleIconClick}
              >
                <div className={classes.iconCircle}>
                  <InsightsRounded
                    className={classes.progressIcon}
                  ></InsightsRounded>
                </div>
              </Link>
              <Link
                className={classes.iconContainer}
                href={RouteType.History}
                onClick={handleIconClick}
              >
                <div className={classes.iconCircle}>
                  <History className={classes.historyIcon}></History>
                </div>
              </Link>
              <Link
                className={`${classes.iconContainer} ${classes.homeIconContainer}`}
                href={RouteType.Home}
                onClick={handleIconClick}
              >
                <div
                  className={`${classes.iconCircle} ${classes.homeIconCircle}`}
                >
                  <HomeOutlined className={classes.homeIcon}></HomeOutlined>
                </div>
              </Link>
              <Link
                className={classes.iconContainer}
                href={RouteType.Add}
                onClick={handleIconClick}
              >
                <div className={classes.iconCircle}>
                  <AddCircleOutline
                    className={classes.addIcon}
                  ></AddCircleOutline>
                </div>
              </Link>
              <Link
                className={classes.iconContainer}
                href={RouteType.Profile}
                onClick={handleIconClick}
              >
                <div className={classes.iconCircle}>
                  <PersonOutline
                    className={classes.profileIcon}
                  ></PersonOutline>
                </div>
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
};
