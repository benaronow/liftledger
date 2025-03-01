import { makeStyles } from "tss-react/mui";

export const useMessageModalStyles = makeStyles()({
  banner: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "40px",
    background: "lightgray",
  },
  leftPad: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "50%",
  },
  rightPad: {
    width: "50%",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "League+Spartan",
    fontSize: "24px",
    fontWeight: 900,
  },
  close: {
    marginLeft: "5px",
    color: "red",
    fontSize: "20px",
    borderRadius: "7.5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  stepsContainer: {
    display: "flex",
    flexDirection: "column",
    height: "calc(85dvh - 40px)",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  shareIcon: {
    marginLeft: "5px",
    transform: "translateY(-2px)",
  },
  step: {
    fontFamily: "League+Spartan",
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "-20px",
  },
  step1Row: {
    marginBottom: "-20px",
  },
  os: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
  descText: {
    padding: "0px 10px 0px 10px",
    textAlign: "center",
  },
  divider: {
    width: "95%",
    height: "2px",
    background: "black",
  },
});
