import { makeStyles } from "tss-react/mui";

export const useEditWeekStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "flex-start",
  },
  entriesContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  entryName: {
    fontFamily: "League+Spartan",
    width: "60%",
    fontWeight: 600,
    fontSize: "16px",
  },
  dayName: {
    fontFamily: "League+Spartan",
    width: "25%",
    fontWeight: 600,
    fontSize: "16px",
  },
  dayNameDisabled: {
    color: "gray",
  },
  entryDivider: {
    width: "100%",
    height: "2px",
    background: "#0096FF",
    marginBottom: "10px",
  },
  day: {
    justifyContent: "space-between",
  },
  dayInfo: {
    marginTop: "0px",
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
    alignItems: "center",
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
    fontSize: "16px",
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
    fontSize: "16px",
  },
  editButton: {
    background: "transparent",
    border: "none",
    color: "#0096FF",
    marginLeft: "5px",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "League+Spartan",
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
