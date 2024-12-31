"use client";

import { makeStyles } from "tss-react/mui";
import { usePathname } from "next/navigation";

const useStyles = makeStyles()({
  header: {
    position: "fixed",
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
  logoContainer: {
    display: "flex",
    flex: "1",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    marginLeft: "7.5px",
    marginTop: "10px",
    marginBottom: "10px",
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
  avatarContainer: {
    display: "flex",
    flex: "1",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  avatar: {
    height: "40px",
    width: "40px",
    marginRight: "7.5px",
    marginTop: "10px",
    marginBottom: "10px",
    border: "solid",
    borderColor: "white",
    borderWidth: "1.5px",
  },
  modalContainer: {},
});

export const Header = () => {
  const { classes } = useStyles();
  const pathname = usePathname();

  return (
    <>
      <div className={pathname === "/" ? classes.noHeader : classes.header}>
        <div className={classes.titleContainer}>
          <span className={classes.title}>liftledger</span>
        </div>
      </div>
    </>
  );
};
