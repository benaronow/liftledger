"use client";

import { useRouter } from "next/navigation";
import { Menu, Person } from "@mui/icons-material";
import { ReactElement, useContext } from "react";
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
import { useHeaderStyles } from "./useHeaderStyles";

export const Header = () => {
  const { classes } = useHeaderStyles();
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

  type MenuButton = {
    route: RouteType;
    title: string;
    icon: ReactElement;
    colorClass: string;
    isEdit: boolean;
  };

  const menuButtonMap: MenuButton[] = [
    {
      route: RouteType.Add,
      title: "Edit Block",
      icon: <FaEdit />,
      colorClass: classes.editButton,
      isEdit: true,
    },
    {
      route: RouteType.Home,
      title: "Quit Block",
      icon: <IoMdCloseCircle />,
      colorClass: classes.quitButton,
      isEdit: false,
    },
    {
      route: RouteType.Progress,
      title: "Progress",
      icon: <GiProgression />,
      colorClass: classes.progressButton,
      isEdit: false,
    },
    {
      route: RouteType.Settings,
      title: "Settings",
      icon: <IoSettingsSharp />,
      colorClass: classes.settingsButton,
      isEdit: false,
    },
  ];

  const buildMenuButton = (button: MenuButton, key: number) => (
    <div key={key} className={classes.menuItem}>
      <button
        className={`${classes.menuButton} ${button.colorClass}`}
        onClick={() => {
          if (button.isEdit && curUser?.curBlock)
            handleCreateFromTemplate(curUser?.curBlock);
          toggleMenuOpen();
          router.push(button.route);
        }}
      >
        <span className={classes.menuText}>{button.title}</span>
        {button.icon}
      </button>
    </div>
  );

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <div className={classes.leftPad}>
          <div className={classes.menuIcon} onClick={toggleMenuOpen}>
            <Menu className={classes.menuIconImg} />
          </div>
        </div>
        <div className={classes.titleContainer}>
          <span className={classes.title} onClick={handleDashboardClick}>
            liftledger
          </span>
        </div>
        <div className={classes.rightPad}>
          <div className={classes.profileIcon} onClick={handleProfileClick}>
            <Person className={classes.profileIconImg} />
          </div>
        </div>
      </div>
      <div className={`${classes.menu} ${menuOpen && classes.menuOpen}`}>
        <div className={classes.menuRow}>
          {menuButtonMap
            .slice(0, 2)
            .map((button, idx) => buildMenuButton(button, idx))}
        </div>
        <div className={classes.menuRow}>
          {menuButtonMap
            .slice(2)
            .map((button, idx) => buildMenuButton(button, idx))}
        </div>
      </div>
    </div>
  );
};
