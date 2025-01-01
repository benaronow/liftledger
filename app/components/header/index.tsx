"use client";

import { makeStyles } from "tss-react/mui";
import { usePathname } from "next/navigation";

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
});

export const Header = () => {
  const { classes } = useStyles();
  const pathname = usePathname();

  return (
    <>
      <div className={pathname === "/" ? classes.noHeader : classes.container}>
        <div className={classes.titleContainer}>
          <span className={classes.title}>liftledger</span>
        </div>
      </div>
    </>
  );
};
