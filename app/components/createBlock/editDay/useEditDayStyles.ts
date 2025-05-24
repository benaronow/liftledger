import { makeStyles } from "tss-react/mui";

export const useEditDayStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "10px 10px 0px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
  entryContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    background: "#3a3a3d",
    borderRadius: "5px",
    padding: "10px",
    margin: "0px 3px",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
  },
  uniEntry: {
    margin: "-10px 0px -10px 0px",
  },
  entryName: {
    fontWeight: 600,
    color: "white",
  },
  sideButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "40px",
    minWidth: "40px",
    height: "240px",
  },
  leftButtons: {
    padding: "0px 3px 0px 0px",
  },
  rightButtons: {
    padding: "0px 0px 0px 3px",
  },
  sideButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "34px",
    height: "110px",
    minHeight: "110px",
    border: "none",
    borderRadius: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  leftButton: {
    height: "110px",
    minHeight: "110px",
  },
  sideButtonTopTop: {
    background: "#3a3a3d",
    transform: "translateY(-110px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-107px)",
    },
  },
  sideButtonTopBottom: {
    background: "#202021",
    transform: "translateY(5px)",
  },
  sideButtonBottomTop: {
    background: "#3a3a3d",
    transform: "translateY(-205px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-202px)",
    },
  },
  sideButtonBottomBottom: {
    background: "#202021",
    transform: "translateY(-90px)",
  },
  rightButton: {
    height: "235px",
    minHeight: "235px",
  },
  sideButtonTop: {
    background: "#3a3a3d",
    transform: "translateY(-235px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-232px)",
    },
  },
  sideButtonBottom: {
    background: "#202021",
    transform: "translateY(5px)",
  },
  moveUpButton: {
    transform: "rotate(90deg)",
  },
  moveDownButton: {
    transform: "rotate(270deg)",
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
  enabled: {
    color: "white",
  },
  disabled: {
    color: "#adafb3",
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
    width: "80%",
    height: "38px",
    paddingLeft: "5px",
    background: "white",
  },
  weightType: {
    width: "100%",
    fontSize: "16px",
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
  submitButtonTop: {
    borderRadius: "5px",
    background: "#0096FF",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  submitButtonBottom: {
    borderRadius: "5px",
    background: "#004c81",
    transform: "translateY(5px)",
  },
});
