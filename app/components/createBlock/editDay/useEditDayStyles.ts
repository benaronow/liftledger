import { makeStyles } from "tss-react/mui";

export const useEditDayStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
  },
  entriesContainer: {
    width: "100%",
  },
  uniEntry: {
    margin: "-10px 0px -10px 0px",
  },
  entryName: {
    fontFamily: "League+Spartan",
    fontWeight: 600,
    fontSize: "16px",
  },
  entryDivider: {
    width: "100%",
    height: "2px",
    background: "#0096FF",
    marginBottom: "10px",
  },
  moveDayButtons: {
    display: "flex",
    flexDirection: "column",
    height: "50px",
    justifyContent: "center",
    alignItems: "center",
  },
  moveUpButton: {
    height: "15px",
    color: "#0096FF",
    transform: "rotate(90deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  moveDownButton: {
    height: "15px",
    color: "#0096FF",
    transform: "rotate(270deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  entryContainer: {
    display: "flex",
    flex: 1,
    padding: "10px 10px 10px 10px",
    background: "lightgray",
    borderRadius: "10px 10px 10px 10px",
    marginLeft: "5px",
    marginRight: "5px",
  },
  entryColumn: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    width: "100%",
    background: "white",
  },
  removeButton: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  disabled: {
    color: "lightgray",
  },
  addExerciseButton: {
    color: "blue",
    marginBottom: "-5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  numberInput: {
    marginLeft: "5px",
    marginRight: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    width: "100%",
    height: "38px",
    paddingLeft: "5px",
    background: "white",
  },
  weightInput: {
    marginLeft: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px 0px 0px 5px",
    width: "100%",
    height: "38px",
    paddingLeft: "5px",
    background: "white",
  },
  goBack: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  backButton: {
    fontFamily: "League+Spartan",
    fontWeight: 600,
    fontSize: "16px",
    color: "#0096FF",
  },
  backArrow: {
    height: "15px",
    color: "#0096FF",
  },
});