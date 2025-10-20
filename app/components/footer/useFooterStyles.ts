import { keyframes } from "tss-react";
import { makeStyles } from "tss-react/mui";

const appear = keyframes`
  from {
    transform: translateY(70px);
  }
  to {
    transform: translateY(0px);
  }
`;

export const useFooterStyles = makeStyles()({
  noDisplay: {
    display: "none",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    background: "#131314",
    height: "75px",
    zIndex: 10,
    borderRadius: "20px 20px 0px 0px",
    transform: "translateY(70px)",
    animation: `${appear} 0.5s forwards`,
  },
  iconRow: {
    width: "95%",
    height: "55px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    fontSize: "28px",
  },
  activeIcon: {
    color: "white",
    "&:link": {
      color: "white",
    },
    "&:active": {
      color: "white",
    },
    "&:hover": {
      color: "white",
    },
    "&:visited": {
      color: "white",
    },
  },
  inactiveIcon: {
    color: "#adafb3",
    "&:link": {
      color: "#adafb3",
    },
    "&:active": {
      color: "#adafb3",
    },
    "&:hover": {
      color: "#adafb3",
    },
    "&:visited": {
      color: "#adafb3",
    },
  },
});
