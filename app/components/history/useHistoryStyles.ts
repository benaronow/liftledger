import { makeStyles } from "tss-react/mui";

export const useHistoryStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
    padding: "65px 15px 85px",
    overflow: "scroll",
  },
  box: {
    width: "100%",
    borderRadius: "10px",
    background: "#58585b",
    padding: "10px 10px 0px",
  },
  entry: {
    display: "flex",
    color: "white",
    background: "#3a3a3d",
    fontFamily: "League+Spartan",
    fontSize: "14px",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: "5px 10px",
    borderRadius: "5px",
    whiteSpace: "nowrap",
  },
  title: {
    fontWeight: "700",
  },
  middlePad: {
    width: "100%",
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
    marginLeft: "10px",
    color: "#0096FF",
    "&:hover": {
      cursor: "pointer",
    },
  },
});
