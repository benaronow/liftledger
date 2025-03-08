"use client";

import { usePathname, useRouter } from "next/navigation";
import { Person } from "@mui/icons-material";
import { ReactElement, useContext } from "react";
import { MenuOpenContext } from "@/app/providers/MenuOpenProvider";
import { useAppDispatch } from "@/lib/hooks";
import {
  selectEditingBlock,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import { getTemplateFromBlock } from "../utils";
import { Block, RouteType } from "@/types";
import { FaEdit } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { GiProgression } from "react-icons/gi";
import { IoSettingsSharp } from "react-icons/io5";
import { LoginContext } from "@/app/providers/loginProvider";
import { useHeaderStyles } from "./useHeaderStyles";
import { useSelector } from "react-redux";

export const Header = () => {
  const { classes } = useHeaderStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { curUser } = useContext(LoginContext);
  const { menuOpen, toggleMenuOpen } = useContext(MenuOpenContext);
  const editingBlock = useSelector(selectEditingBlock);

  const handleCreateFromTemplate = (block: Block) => {
    dispatch(setTemplate(getTemplateFromBlock(block, true)));
    dispatch(setEditingBlock(true));
  };

  type MenuButton = {
    route: RouteType;
    title: string;
    icon: ReactElement;
    isEdit: boolean;
  };

  const getTitle = () => {
    if (pathname.includes(RouteType.Progress)) return "Progress";
    if (pathname.includes(RouteType.History)) return "History";
    if (pathname.includes(RouteType.Add))
      return editingBlock ? "Edit Block" : "Create Block";
    if (pathname.includes(RouteType.Settings)) return "Settings";
    if (pathname.includes(RouteType.Profile)) return "Profile";
    if (pathname.includes(RouteType.Workout)) return "Workout";
    return "Home";
  };

  const menuButtonMap: MenuButton[] = [
    {
      route: RouteType.Add,
      title: "Edit Block",
      icon: <FaEdit className={classes.menuButtonIcon} />,
      isEdit: true,
    },
    {
      route: RouteType.Home,
      title: "Quit Block",
      icon: <IoMdCloseCircle className={classes.menuButtonIcon} />,
      isEdit: false,
    },
    {
      route: RouteType.Progress,
      title: "Progress",
      icon: <GiProgression className={classes.menuButtonIcon} />,
      isEdit: false,
    },
    {
      route: RouteType.Settings,
      title: "Settings",
      icon: <IoSettingsSharp className={classes.menuButtonIcon} />,
      isEdit: false,
    },
  ];

  const buildMenuButton = (button: MenuButton, key: number) => (
    <div key={key} className={classes.menuItem}>
      <button
        className={classes.menuButton}
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
          <span className={classes.title}>{getTitle()}</span>
        </div>
        <div className={classes.rightPad}>
          <div
            className={classes.profileIcon}
            onClick={() => router.push("/profile")}
          >
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
