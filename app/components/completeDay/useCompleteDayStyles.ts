import { makeStyles } from "tss-react/mui";

export const useCompleteDayStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 60px)",
    padding: "15px 15px 85px",
    overflow: "scroll",
  },
  box: {
    width: "100%",
    borderRadius: "10px",
    background: "#58585b",
    padding: "10px 10px 0px",
  },
  exerciseContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    background: "#3a3a3d",
    borderRadius: "10px",
    padding: "10px 10px 0px",
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
    color: "white",
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
    color: "white",
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
    background: "white",
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
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    width: "100%",
    background: "white",
    fontSize: "16px",
    paddingLeft: "5px",
  },
  actions: {
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: "10px",
  },
  buttonContainer: {
    width: "100%",
    height: "35px",
  },
  actionButton: {
    width: "100%",
    height: "30px",
    border: "none",
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
  prevButtonTop: {
    borderRadius: "5px 0px 0px 5px",
    background: "#a3258c",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  prevButtonBottom: {
    borderRadius: "5px 0px 0px 5px",
    background: "#5f1652",
    transform: "translateY(5px)",
  },
  nextButtonTop: {
    background: "#0096FF",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  nextButtonBottom: {
    background: "#004c81",
    transform: "translateY(5px)",
  },
  nextButtonSide: {
    borderRadius: "5px 0px 0px 5px",
  },
  pauseButtonTop: {
    borderRadius: "0px 5px 5px 0px",
    background: "red",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  pauseButtonBottom: {
    borderRadius: "0px 5px 5px 0px",
    background: "#830000",
    transform: "translateY(5px)",
  },
  changeSetButtonContainer: {
    width: "20px",
    height: "23px",
  },
  leftContainer: {
    marginRight: "5px",
  },
  rightContainer: {
    marginLeft: "5px",
  },
  changeSetButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "20px",
    color: "white",
    "&:hover": {
      cursor: "pointer",
    },
  },
  addSetButtonTop: {
    background: "#0096FF",
    height: "20px",
    borderRadius: "10px",
    transform: "translateY(-20px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-18px)",
    },
  },
  addSetButtonBottom: {
    background: "#004c81",
    height: "15px",
    width: "20px",
    borderRadius: "0px 0px 10px 10px",
    transform: "translateY(3px)",
  },
  subtractSetButtonTop: {
    background: "red",
    height: "20px",
    borderRadius: "10px",
    transform: "translateY(-20px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-18px)",
    },
  },
  subtractSetButtonBottom: {
    background: "#830000",
    height: "15px",
    width: "20px",
    borderRadius: "0px 0px 10px 10px",
    transform: "translateY(3px)",
  },
  changeSetIcon: {
    fontSize: "18px",
  },
  setsEntry: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  sets: {
    marginBottom: "10px",
  },
});
