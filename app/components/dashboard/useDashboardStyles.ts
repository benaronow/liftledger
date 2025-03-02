import { makeStyles } from "tss-react/mui";

export const useDashboardStyles = makeStyles()({
  container: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 120px)",
    padding: "0px 50px 0px",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "League+Spartan",
    color: "white",
    fontWeight: 900,
  },
  titleSmall: {
    fontSize: "16px",
    marginBottom: "5px",
  },
  titleBig: {
    fontSize: "24px",
  },
  entry: {
    display: "flex",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    color: "white",
    whiteSpace: "nowrap",
  },
  name: {
    display: "flex",
    fontWeight: 700,
    width: "75%",
    justifyContent: "flex-start",
    textAlign: "left",
  },
  value: {
    display: "flex",
    width: "125%",
    justifyContent: "flex-end",
    textAlign: "right",
  },
  loginButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#0096FF",
    fontWeight: 600,
    transform: "translateY(calc(50dvh - 70px))",
    "&:hover": {
      cursor: "pointer",
    },
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
  buttonContainer: {
    width: "100%",
    height: "67px",
  },
  startButtonBase: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "20px",
    fontWeight: 600,
    border: "none",
    borderRadius: "25px",
    height: "60px",
  },
  startButtonTop: {
    background: "#0096FF",
    transition: "transform 0.1s",
    transform: "translateY(-60px)",
    "&:active": {
      transform: "translateY(-55px)",
    },
  },
  startButtonBottom: {
    background: "#004c81",
    transform: "translateY(7px)",
  },
});
