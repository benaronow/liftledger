"use client";

import { usePathname, useRouter } from "next/navigation";
import { makeStyles } from "tss-react/mui";
import {
  AddCircleOutline,
  History,
  HomeOutlined,
  InsightsRounded,
  PersonOutline,
} from "@mui/icons-material";
import { RouteType } from "@/types";
import { useContext } from "react";
import { LoginContext } from "../../providers/loginContext";

const useStyles = makeStyles()((theme) => ({
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "#a3258c",
    height: "70px",
    zIndex: "10",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  iconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50px",
    width: "50px",
    borderRadius: "25px",
    background: "#a3258c",
    transform: "translateY(-5px)",
  },
  homeIconContainer: {
    height: "65px",
    width: "65px",
    borderRadius: "32.5px",
    transform: "translateY(-10px)",
  },
  iconCircle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "40px",
    width: "40px",
    borderRadius: "20px",
    background: "white",
  },
  homeIconCircle: {
    height: "55px",
    width: "55px",
    borderRadius: "27.5px",
  },
  icon: {
    color: "#a3258c",
    fontSize: "40px",
  },
  progressIcon: {
    color: "#a3258c",
    fontSize: "30px",
  },
  historyIcon: {
    color: "#a3258c",
    fontSize: "35px",
    marginRight: "2px",
  },
  homeIcon: {
    color: "#a3258c",
    fontSize: "50px",
  },
  addIcon: {
    color: "#a3258c",
    fontSize: "33px",
    marginTop: "1px",
  },
  profileIcon: {
    color: "#a3258c",
    fontSize: "35px",
  },
}));

export const Footer = () => {
  const { classes } = useStyles();
  const { curUser } = useContext(LoginContext);
  const router = useRouter();
  const pathname = usePathname();

  // const [isStandalone, setIsStandalone] = useState(true);
  // useEffect(() => {
  //   setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  // }, []);

  const handleIconClick = (type: RouteType) => {
    if (curUser) router.push(type);
  };

  return (
    <>
      {pathname !== "/" && (
        <div
          className={classes.container}
        >
          <div className={classes.iconContainer}>
            <div
              className={classes.iconCircle}
              onClick={() => handleIconClick(RouteType.Progress)}
            >
              <InsightsRounded
                className={classes.progressIcon}
              ></InsightsRounded>
            </div>
          </div>
          <div className={classes.iconContainer}>
            <div
              className={classes.iconCircle}
              onClick={() => handleIconClick(RouteType.History)}
            >
              <History className={classes.historyIcon}></History>
            </div>
          </div>
          <div
            className={`${classes.iconContainer} ${classes.homeIconContainer}`}
          >
            <div
              className={`${classes.iconCircle} ${classes.homeIconCircle}`}
              onClick={() => handleIconClick(RouteType.Home)}
            >
              <HomeOutlined className={classes.homeIcon}></HomeOutlined>
            </div>
          </div>
          <div className={classes.iconContainer}>
            <div
              className={classes.iconCircle}
              onClick={() => handleIconClick(RouteType.Add)}
            >
              <AddCircleOutline className={classes.addIcon}></AddCircleOutline>
            </div>
          </div>
          <div className={classes.iconContainer}>
            <div
              className={classes.iconCircle}
              onClick={() => handleIconClick(RouteType.Profile)}
            >
              <PersonOutline className={classes.profileIcon}></PersonOutline>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
