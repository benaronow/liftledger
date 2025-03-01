import { makeStyles } from "tss-react/mui";

export const useFooterStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    background: "#a3258c",
    height: "70px",
    zIndex: 10,
    [theme.breakpoints.up("sm")]: {
      display: "none",
      zIndex: 0,
    },
  },
  iconRow: {
    width: "95%",
    height: "50px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "50px",
  },
  progressIcon: {
    color: "white",
    fontSize: "28px",
  },
  historyIcon: {
    color: "white",
    fontSize: "35px",
    marginRight: "2px",
  },
  homeIcon: {
    color: "white",
    fontSize: "50px",
  },
  addIcon: {
    color: "white",
    fontSize: "33px",
    marginTop: "1px",
  },
  profileIcon: {
    color: "white",
    fontSize: "35px",
  },
}));
