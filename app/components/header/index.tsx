"use client";

import { makeStyles } from "tss-react/mui";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Person } from "@mui/icons-material";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    background: "#6d6e71",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "100%",
    zIndex: 10,
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
    color: "#a3258c",
    fontSize: "30px",
    fontFamily: "Mina",
    fontWeight: "700",
    textShadow:
      "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
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
    fontFamily: "League+Spartan",
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
      <div className={classes.container}>
        <div className={classes.leftPad}>
          <div
            className={classes.changePage}
            onClick={
              pathname === "/dashboard"
                ? handleProgressClick
                : handleDashboardClick
            }
          >
            <Menu style={{ fontSize: "35px" }} />
          </div>
        </div>
        <div className={classes.titleContainer}>
          <span className={classes.title} onClick={handleDashboardClick}>
            liftledger
          </span>
        </div>
        <div className={classes.rightPad}>
          <div
            className={classes.profileContainer}
            onClick={handleProfileClick}
            style={{
              display: "flex",
              height: "30px",
              width: "30px",
              borderRadius: "15px",
              background: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Person style={{ color: "#6d6e71", fontSize: "27px" }} />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          background: "white",
          height: "2px",
          width: "94%",
          transform: "translateX(3%)",
        }}
      ></div>
    </>
  );
};
