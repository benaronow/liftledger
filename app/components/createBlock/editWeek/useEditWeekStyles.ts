import { makeStyles } from "tss-react/mui";

export const useEditWeekStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "0px 10px",
    fontFamily: "League+Spartan",
    fontWeight: 600,
    fontSize: "14px",
  },
  head: {
    width: "100%",
    padding: "15px 0px",
    color: "white",
  },
  day: {
    width: "100%",
    height: "130px",
    marginBottom: "10px",
  },
  dayName: {
    width: "25%",
    color: "white",
  },
  dayNameDisabled: {
    color: "#adafb3",
  },
  sideButtons: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "40px",
    height: "130px",
  },
  leftButtons: {
    padding: "0px 3px 0px 0px",
  },
  rightButtons: {
    padding: "0px 0px 0px 3px",
  },
  sideButton: {
    background: "#3a3a3d",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "34",
    height: "60px",
    borderRadius: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  moveUpButton: {
    transform: "rotate(90deg)",
  },
  moveDownButton: {
    transform: "rotate(270deg)",
  },
  entryContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0px 3px",
  },
  entryColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "130px",
    borderRadius: "5px",
    alignItems: "center",
    background: "#3a3a3d",
    padding: "10px",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-start",
  },
  entryName: {
    width: "60%",
  },
  dayValidText: {
    color: "#32CD32",
    fontSize: "12px",
    fontWeight: "bold",
  },
  invalid: {
    color: "red",
  },
  input: {
    paddingLeft: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    background: "white",
    width: "100%",
    fontSize: "14px",
  },
  dateInput: {
    paddingLeft: "0px",
  },
  nameInput: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    background: "white",
    width: "100%",
    paddingLeft: "5px",
    fontSize: "14px",
  },
  editButton: {
    background: "transparent",
    border: "none",
    color: "#0096FF",
    marginLeft: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  removeButton: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  disabled: {
    color: "lightgray",
  },
  addDayButton: {
    color: "#0096FF",
    marginBottom: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
});
