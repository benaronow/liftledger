import { makeStyles } from "tss-react/mui";

export const useCreateBlockStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
    padding: "65px 15px 90px",
    overflow: "scroll",
  },
  box: {
    width: "100%",
    borderRadius: "10px",
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
});
