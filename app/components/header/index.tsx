"use client";

import { makeStyles } from "tss-react/mui";
import { useRouter } from "next/navigation";
import { Menu, Person } from "@mui/icons-material";
import { useContext } from "react";
import { MenuOpenContext } from "@/app/providers/MenuOpenProvider";
import { useAppDispatch } from "@/lib/hooks";
import { setEditingBlock, setTemplate } from "@/lib/features/user/userSlice";
import { getTemplateFromBlock } from "../utils";
import { Block, RouteType } from "@/types";
import { FaEdit } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { GiProgression } from "react-icons/gi";
import { IoSettingsSharp } from "react-icons/io5";
import { LoginContext } from "@/app/providers/loginProvider";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    alignItems: "flex-start",
    height: "150px",
    width: "100%",
    position: "relative",
  },
  head: {
    background: "#6d6e71",
    display: "flex",
    alignItems: "center",
    height: "50px",
    width: "100%",
    zIndex: 1,
  },
  noHeader: {
    height: "50px",
    display: "none",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#a3258c",
    fontSize: "30px",
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
  goTo: {
    marginRight: "5px",
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
  profile: {
    color: "#a3258c",
    background: "white",
    borderRadius: "20px",
    height: "35px",
    width: "35px",
  },
  menu: {
    position: "absolute",
    top: 50,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100px",
    background: "white",
    borderRadius: "0px 0px 10px 10px",
    transform: "translateY(-100px)",
    transition: "transform 0.4s ease-out",
  },
  menuOpen: {
    transform: "translateY(0px)",
  },
  menuRow: {
    display: "flex",
    width: "100%",
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
    fontSize: "18px",
    border: "none",
    background: "none",
  },
  menuText: {
    marginRight: "5px",
    whiteSpace: "nowrap",
  },
});

export const Header = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { curUser } = useContext(LoginContext);
  const { menuOpen, toggleMenuOpen } = useContext(MenuOpenContext);

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleCreateFromTemplate = (block: Block) => {
    dispatch(setTemplate(getTemplateFromBlock(block, true)));
    dispatch(setEditingBlock(true));
  };

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <div className={classes.leftPad}>
          <div className={classes.menuIcon} onClick={toggleMenuOpen}>
            <Menu style={{ fontSize: "35px" }} />
          </div>
        </div>
        <div className={classes.titleContainer}>
          <span className={classes.title} onClick={handleDashboardClick}>
            liftledger
          </span>
        </div>
        <div className={classes.rightPad}>
          <div className={classes.profileIcon} onClick={handleProfileClick}>
            <Person style={{ fontSize: "27px" }} />
          </div>
        </div>
      </div>
      <div className={`${classes.menu} ${menuOpen && classes.menuOpen}`}>
        <div className={classes.menuRow}>
          <div className={classes.menuItem}>
            <button
              className={classes.menuButton}
              style={{ color: "#32CD32" }}
              onClick={() => {
                if (curUser?.curBlock)
                  handleCreateFromTemplate(curUser?.curBlock);
                toggleMenuOpen();
                router.push(RouteType.Add);
              }}
            >
              <span className={classes.menuText}>Edit Block</span>
              <FaEdit />
            </button>
          </div>
          <div className={classes.menuItem}>
            <button
              className={classes.menuButton}
              onClick={() => {
                toggleMenuOpen();
                router.push(RouteType.Home);
              }}
            >
              <span className={classes.menuText}>Quit Block</span>
              <IoMdCloseCircle />
            </button>
          </div>
        </div>
        <div className={classes.menuRow}>
          <div className={classes.menuItem}>
            <button
              className={classes.menuButton}
              onClick={() => {
                toggleMenuOpen();
                router.push(RouteType.Progress);
              }}
            >
              <span className={classes.menuText}>View Progress</span>
              <GiProgression />
            </button>
          </div>
          <div className={classes.menuItem}>
            <button
              className={classes.menuButton}
              onClick={() => {
                toggleMenuOpen();
                router.push(RouteType.Settings);
              }}
            >
              <span className={classes.menuText}>Settings</span>
              <IoSettingsSharp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
