import { makeStyles } from "tss-react/mui";

export const useCreateBlockStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 50px)",
    padding: "15px 15px 85px",
    overflow: "scroll",
  },
  box: {
    width: "100%",
    borderRadius: "25px",
    background: "#58585b",
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
  actions: {
    display: "flex",
    width: "100%",
    justifyContent: "space-around",
    padding: "0px 10px",
    marginBottom: "15px",
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
  submitButtonTop: {
    borderRadius: "5px 0px 0px 5px",
    background: "#0096FF",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  submitButtonBottom: {
    borderRadius: "5px 0px 0px 5px",
    background: "#004c81",
    transform: "translateY(5px)",
  },
  clearButtonTop: {
    borderRadius: "0px 5px 5px 0px",
    background: "red",
    transform: "translateY(-30px)",
    transition: "transform 0.1s",
    "&:active": {
      transform: "translateY(-27px)",
    },
  },
  clearButtonBottom: {
    borderRadius: "0px 5px 5px 0px",
    background: "#830000",
    transform: "translateY(5px)",
  },
});
