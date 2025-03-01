import { makeStyles } from "tss-react/mui";

export const useCompleteDayStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 60px)",
    padding: "0px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 60px)",
      overflow: "hidden",
    },
  },
  exerciseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
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
  descText: {
    fontFamily: "League+Spartan",
    fontWeight: 600,
    fontSize: "10px",
  },
  entryTitle: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
  eName: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "10px",
    textWrap: "nowrap",
  },
  entry: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    marginBottom: "10px",
    textAlign: "center",
    justifyContent: "center",
  },
  entryName: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 400,
  },
  entrySetsReps: {
    marginRight: "5px",
  },
  entryWeight: {
    margin: "0px 5px 0px 10px",
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    width: "100%",
    paddingLeft: "5px",
    fontSize: "16px",
    marginRight: "5px",
  },
  noteName: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 400,
    whiteSpace: "nowrap",
    marginRight: "5px",
  },
  noteInput: {
    width: "100%",
  },
  actions: {
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: "10px",
  },
  previousExerciseButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#0096FF",
    fontWeight: 600,
    whiteSpace: "nowrap",
    "&:hover": {
      cursor: "pointer",
    },
  },
  completeExerciseButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#32CD32",
    fontWeight: 600,
    whiteSpace: "nowrap",
    "&:hover": {
      cursor: "pointer",
    },
  },
  quitButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "red",
    fontWeight: 600,
    whiteSpace: "nowrap",
    "&:hover": {
      cursor: "pointer",
    },
  },
  addSet: {
    fontSize: "18px",
    color: "#0096FF",
  },
  subtractSet: {
    fontSize: "18px",
    color: "red",
  },
}));
