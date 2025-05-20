"use client";

import { usePathname } from "next/navigation";
import { RouteType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { useTheme } from "@mui/material";
import { useAppDispatch } from "@/lib/hooks";
import {
  selectCurBlock,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import Link from "next/link";
import { useFooterStyles } from "./useFooterStyles";
import { GiProgression } from "react-icons/gi";
import { FaEdit, FaHistory } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { getTemplateFromBlock } from "../utils";
import { LoginContext } from "@/app/providers/loginProvider";
import { useSelector } from "react-redux";

export const Footer = () => {
  const { classes } = useFooterStyles();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { curUser } = useContext(LoginContext);
  const curBlock = useSelector(selectCurBlock);
  const { innerWidth, innerHeight, toggleScreenState } =
    useContext(ScreenStateContext);
  const theme = useTheme();

  const [isStandalone, setIsStandalone] = useState(true);
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleIconClick = (route: string) => {
    if (!pathname.includes(route)) {
      toggleScreenState("fetching", true);
      if (route === RouteType.Add && curBlock) {
        dispatch(setTemplate(getTemplateFromBlock(curBlock, true)));
        dispatch(setEditingBlock(true));
      } else {
        dispatch(setTemplate(undefined));
        dispatch(setEditingBlock(false));
      }
    }
  };

  const navButtonMap = [
    {
      route: RouteType.Progress,
      icon: <GiProgression />,
      isHome: false,
    },
    {
      route: RouteType.History,
      icon: <FaHistory />,
      isHome: false,
    },
    {
      route: RouteType.Home,
      icon: (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minWidth: "60px",
          }}
        >
          <img
            src="/icon.png"
            alt="Description of image"
            height={40}
            width={40}
          />
        </div>
      ),
      isHome: true,
    },
    {
      route: RouteType.Add,
      icon: <FaEdit />,
      isHome: false,
    },
    {
      route: RouteType.Settings,
      icon: <IoSettingsSharp />,
      isHome: false,
    },
  ];

  return (
    <>
      {pathname !== "/" && curUser && (
        <div
          className={`${
            innerHeight &&
            innerHeight < 500 &&
            innerWidth &&
            innerWidth > theme.breakpoints.values["sm"]
              ? classes.noDisplay
              : classes.container
          }`}
          style={{ transform: `translateY(${isStandalone ? "0px" : "0px"})` }}
        >
          <div className={classes.iconRow}>
            {navButtonMap.map((button, idx) => (
              <Link
                key={idx}
                style={{
                  width: button.route === RouteType.Home ? "60px" : "50px",
                }}
                className={`${classes.iconContainer} ${
                  pathname.includes(button.route)
                    ? classes.activeIcon
                    : classes.inactiveIcon
                }`}
                href={button.route}
                onClick={() => handleIconClick(button.route)}
              >
                {button.icon}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
