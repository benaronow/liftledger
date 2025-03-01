import { makeStyles } from "tss-react/mui";

export const useProgressStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: "0px 10px",
    height: "calc(100dvh - 60px)",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 60px)",
    },
  },
  dayLabel: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    background: "black",
    minHeight: "30px",
    alignItems: "center",
    border: "solid",
    borderWidth: "1px",
    borderColor: "black",
    color: "white",
  },
  bottom: {
    borderRadius: "0px 0px 25px 25px",
  },
  cell: {
    border: "solid",
    borderWidth: "1px",
    left: 0,
    minWidth: 100,
    maxWidth: 100,
    width: 100,
  },
  stickyCell: {
    position: "sticky",
    zIndex: 2,
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  horizontalDivider: {
    width: "100%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    textAlign: "center",
  },
}));