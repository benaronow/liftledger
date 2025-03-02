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
    fontSize: "15px",
    color: "white",
  },
  head: {
    width: "100%",
    padding: "15px 0px 0px",
    color: "white",
  },
  day: {
    width: "100%",
    height: "130px",
    marginBottom: "10px",
  },
  dayInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "130px",
    borderRadius: "5px",
    alignItems: "center",
    background: "#3a3a3d",
    padding: "10px",
    margin: "0px 3px",
  },
  sideButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "40px",
    minWidth: "40px",
    height: "130px",
  },
  leftButtons: {
    padding: "0px 3px 0px 0px",
  },
  rightButtons: {
    padding: "0px 0px 0px 3px",
  },
  sideButton: {
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "34px",
    height: "55px",
    minHeight: "55px",
    border: "none",
    borderRadius: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  sideButtonTopTop: {
    background: "#3a3a3d",
    transform: "translateY(-55px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-52px)",
    },
  },
  sideButtonTopBottom: {
    background: "#202021",
    transform: "translateY(5px)",
  },
  sideButtonBottomTop: {
    background: "#3a3a3d",
    transform: "translateY(-95px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-92px)",
    },
  },
  sideButtonBottomBottom: {
    background: "#202021",
    transform: "translateY(-35px)",
  },
  moveUpButton: {
    transform: "rotate(90deg)",
  },
  moveDownButton: {
    transform: "rotate(270deg)",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-start",
  },
  headEntry: {
    fontWeight: 600,
    marginBottom: "10px",
  },
  entryName: {
    width: "60%",
  },
  dayName: {
    width: "25%",
  },
  disabled: {
    color: "#adafb3",
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
  },
  editButton: {
    background: "transparent",
    border: "none",
    color: "#0096FF",
    marginLeft: "5px",
    fontSize: "15px",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
  removeButton: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  addDayButtonContainer: {
    width: "100%",
    height: "35px",
    marginBottom: "10px",
  },
  addDayButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "30px",
    borderRadius: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  addDayButtonTop: {
    background: "#3a3a3d",
    color: "white",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  addDayButtonBottom: {
    background: "#202021",
    transform: "translateY(5px)",
  },
});
