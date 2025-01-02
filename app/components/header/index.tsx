"use client";

import { makeStyles } from "tss-react/mui";
import { usePathname } from "next/navigation";
import { Avatar, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { LoginContext } from "@/app/providers/loginContext";

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
    marginLeft: "10px",
    color: "white",
    fontSize: "18px",
    fontFamily: "Gabarito",
    fontWeight: 600,
  },
  rightPad: {
    width: "50%",
    display: "flex",
    justifyContent: "flex-end",
  },
  avatar: {
    marginRight: "10px",
  },
});

export const Header = () => {
  const { classes } = useStyles();
  const pathname = usePathname();
  const theme = useTheme();
  const { session } = useContext(LoginContext);

  const [width, setWidth] = useState(window.innerWidth);
  const updateWidth = () => {
    setWidth(window.innerWidth);
  };
  window.addEventListener("resize", updateWidth);

  return (
    <>
      <div className={pathname === "/" ? classes.noHeader : classes.container}>
        <div className={classes.leftPad}>
          {width > theme.breakpoints.values["sm"] && (
            <span className={classes.changePage}>Hello</span>
          )}
        </div>
        <div className={classes.titleContainer}>
          <span className={classes.title}>liftledger</span>
        </div>
        <div className={classes.rightPad}>
          {width > theme.breakpoints.values["sm"] && (
            <Avatar className={classes.avatar} src={session?.user.picture} />
          )}
        </div>
      </div>
    </>
  );
};
