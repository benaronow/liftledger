import { makeStyles } from "tss-react/mui";

export const useFooterStyles = makeStyles()({
  noDisplay: {
    display: "none",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    background: "#58585b",
    height: "70px",
    zIndex: 10,
    borderRadius: "20px 20px 0px 0px",
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
    fontSize: "28px",
  },
  activeIcon: {
    color: "white",
  },
  inactiveIcon: {
    color: "#adafb3",
  },
});
