import { keyframes } from "tss-react";
import { makeStyles } from "tss-react/mui";

const appear = keyframes`
  from {
    transform: translateY(-50px);
  }
  to {
    transform: translateY(0px);
  }
`;

export const useHeaderStyles = makeStyles()({
  noDisplay: {
    display: "none",
  },
  container: {
    background: "#131314",
    display: "flex",
    alignItems: "center",
    height: "50px",
    width: "100%",
    zIndex: 10,
    borderRadius: "0px 0px 20px 20px",
    transform: "translateY(-50px)",
    animation: `${appear} 0.5s forwards`,
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: "25px",
    fontFamily: "Mina",
    fontWeight: "700",
    whiteSpace: "nowrap",
    marginLeft: "15px",
    height: "35px",
    borderRadius: "17.5px",
  },
  leftPad: {
    width: "50%",
    display: "flex",
    justifyContent: "flex-start",
  },
  rightPad: {
    width: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profileIcon: {
    display: "flex",
    marginRight: "10px",
    height: "30px",
    width: "30px",
    borderRadius: "17.5px",
    background: "white",
    color: "#6d6e71",
    justifyContent: "center",
    alignItems: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
  profileIconImg: {
    fontSize: "27px",
  },
});
