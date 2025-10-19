"use client";

import { usePathname } from "next/navigation";
import { RouteType } from "@/lib/types";
import { useEffect, useState } from "react";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useTheme } from "@mui/material";
import Link from "next/link";
import { useFooterStyles } from "./useFooterStyles";
import { GiProgression } from "react-icons/gi";
import { FaEdit, FaHistory } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { useUser } from "@/app/providers/UserProvider";
import { useBlock } from "@/app/providers/BlockProvider";

export const Footer = () => {
  const { classes } = useFooterStyles();
  const pathname = usePathname();
  const { curUser } = useUser();
  const { curBlock, setTemplateBlock } = useBlock();
  const { innerWidth, innerHeight, toggleScreenState } = useScreenState();
  const theme = useTheme();

  const [isStandalone, setIsStandalone] = useState(true);
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleIconClick = (route: string) => {
    if (!pathname.includes(route)) {
      toggleScreenState("fetching", true);
      if (route === RouteType.Add && curBlock) {
        setTemplateBlock(curBlock);
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
