import { makeStyles } from "tss-react/mui";

export const useHeaderStyles = makeStyles()({
  container: {
    display: "flex",
    alignItems: "flex-start",
    height: "150px",
    width: "100%",
    position: "relative",
  },
  head: {
    background: "#58585b",
    display: "flex",
    alignItems: "center",
    height: "50px",
    width: "100%",
    zIndex: 1,
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#a3258c",
    fontSize: "25px",
    fontFamily: "Mina",
    fontWeight: "700",
    textShadow:
      "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
  },
  leftPad: {
    width: "50%",
    display: "flex",
    justifyContent: "flex-start",
  },
  menuIcon: {
    display: "flex",
    marginLeft: "10px",
    color: "white",
    alignItems: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
  menuIconImg: {
    fontSize: "35px",
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
    borderRadius: "15px",
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
  menu: {
    position: "absolute",
    top: 50,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100px",
    background: "white",
    borderRadius: "0px 0px 20px 20px",
    transform: "translateY(-101px)",
    transition: "transform 0.25s ease-out",
  },
  menuOpen: {
    transform: "translateY(0px)",
  },
  menuRow: {
    display: "flex",
    width: "90%",
  },
  menuItem: {
    display: "flex",
    width: "100%",
    height: "50px",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    display: "flex",
    alignItems: "center",
    fontFamily: "League+Spartan",
    fontSize: "20px",
    border: "none",
    background: "none",
  },
  menuButtonIcon: {
    color: "#0096FF",
  },
  menuText: {
    marginRight: "5px",
    whiteSpace: "nowrap",
    color: "#0096FF",
  },
});
