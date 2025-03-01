import { makeStyles } from "tss-react/mui";

export const useHistoryStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 60px)",
    padding: "10px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 60px)",
      overflow: "hidden",
    },
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
    textAlign: "center",
  },
  horizontalDivider: {
    width: "100%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  entry: {
    display: "flex",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    textAlign: "center",
  },
  completedBlockEntry: {
    justifyContent: "space-between",
  },
  duplicateButton: {
    color: "#0096FF",
    "&:hover": {
      cursor: "pointer",
    },
  },
}));
