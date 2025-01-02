"use client";

import { makeStyles } from "tss-react/mui";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@mui/material";
import { useContext } from "react";
import { ExitToAppOutlined, PersonOutline } from "@mui/icons-material";
import { InnerWidthContext } from "@/app/providers/innerWidthProvider";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    background: "#a3258c",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "100%",
    zIndex: "10",
  },
  noHeader: {
    height: "50px",
    display: "none",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: "30px",
    fontFamily: "Mina",
    fontWeight: "700",
  },
  leftPad: {
    width: "50%",
    display: "flex",
    justifyContent: "flex-start",
  },
  changePage: {
    display: "flex",
    alignContent: "center",
    marginLeft: "10px",
    color: "white",
    fontSize: "18px",
    fontFamily: "Gabarito",
    fontWeight: 600,
    alignItems: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
  goTo: {
    marginRight: "5px",
  },
  rightPad: {
    width: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profileContainer: {
    display: "flex",
    alignContent: "center",
    marginRight: "10px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  profile: {
    color: "#a3258c",
    background: "white",
    borderRadius: "20px",
    height: "35px",
    width: "35px",
  },
});

export const Header = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { innerWidth } = useContext(InnerWidthContext);

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleProgressClick = () => {
    router.push("/progress");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <>
      <div className={pathname === "/" ? classes.noHeader : classes.container}>
        <div className={classes.leftPad}>
          {innerWidth && innerWidth > theme.breakpoints.values["sm"] && (
            <div
              className={classes.changePage}
              onClick={
                pathname === "/dashboard"
                  ? handleProgressClick
                  : handleDashboardClick
              }
            >
              <span className={classes.goTo}>
                {pathname === "/dashboard"
                  ? "Go to progress"
                  : "Go to dashboard"}
              </span>
              <ExitToAppOutlined />
            </div>
          )}
        </div>
        <div className={classes.titleContainer}>
          <span className={classes.title}>liftledger</span>
        </div>
        <div className={classes.rightPad}>
          {innerWidth && innerWidth > theme.breakpoints.values["sm"] && (
            <div
              className={classes.profileContainer}
              onClick={handleProfileClick}
            >
              <PersonOutline className={classes.profile} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
