"use client";

import { usePathname } from "next/navigation";
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
import Image from "next/image";
import { GiProgression } from "react-icons/gi";
import { FaEdit, FaHistory } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

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
        <Image
          src="/icon.png"
          alt="Description of image"
          height={40}
          width={40}
        />
      ),
      isHome: true,
    },
    {
      route: RouteType.Add,
      icon: <FaEdit />,
      isHome: false,
    },
    {
      route: RouteType.Profile,
      icon: <IoSettingsSharp />,
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
          <div className={classes.iconRow}>
            {innerWidth && innerWidth < theme.breakpoints.values["sm"] && (
              <>
                {navButtonMap.map((button, idx) => (
                  <Link
                    key={idx}
                    className={classes.iconContainer}
                    href={button.route}
                    onClick={handleIconClick}
                  >
                    {button.icon}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
