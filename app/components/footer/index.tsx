"use client";

import { usePathname } from "next/navigation";
import {
  AddCircleOutline,
  History,
  HomeOutlined,
  InsightsRounded,
  PersonOutline,
} from "@mui/icons-material";
import { RouteType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { useTheme } from "@mui/material";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCurDay,
  setCurExercise,
  setCurWeek,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import Link from "next/link";
import { useFooterStyles } from "./useFooterStyles";

export const Footer = () => {
  const { classes } = useFooterStyles();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();

  const [isStandalone, setIsStandalone] = useState(true);
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleIconClick = () => {
    dispatch(setTemplate(undefined));
    dispatch(setEditingBlock(false));
    dispatch(setCurWeek(undefined));
    dispatch(setCurDay(undefined));
    dispatch(setCurExercise(undefined));
  };

  const navButtonMap = [
    {
      route: RouteType.Progress,
      icon: (
        <InsightsRounded className={classes.progressIcon}></InsightsRounded>
      ),
      isHome: false,
    },
    {
      route: RouteType.History,
      icon: <History className={classes.historyIcon}></History>,
      isHome: false,
    },
    {
      route: RouteType.Home,
      icon: <HomeOutlined className={classes.homeIcon}></HomeOutlined>,
      isHome: true,
    },
    {
      route: RouteType.Add,
      icon: <AddCircleOutline className={classes.addIcon}></AddCircleOutline>,
      isHome: false,
    },
    {
      route: RouteType.Profile,
      icon: <PersonOutline className={classes.profileIcon}></PersonOutline>,
      isHome: false,
    },
  ];

  return (
    <>
      {pathname !== "/" && (
        <div
          className={classes.container}
          style={{ transform: `translateY(${isStandalone ? "0px" : "10px"})` }}
        >
          {innerWidth && innerWidth < theme.breakpoints.values["sm"] && (
            <>
              {navButtonMap.map((button, idx) => (
                <Link
                  key={idx}
                  className={`${classes.iconContainer} ${
                    button.isHome && classes.homeIconContainer
                  }`}
                  href={button.route}
                  onClick={handleIconClick}
                >
                  <div
                    className={`${classes.iconCircle} ${
                      button.isHome && classes.homeIconCircle
                    }`}
                  >
                    {button.icon}
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
};
