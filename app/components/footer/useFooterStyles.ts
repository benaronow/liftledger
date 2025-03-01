import { makeStyles } from "tss-react/mui";

export const useFooterStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    background: "#58585b",
    height: "70px",
    zIndex: 10,
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
    color: "white",
    fontSize: "28px",
  },
});
