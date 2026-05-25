"use client";

import { usePathname } from "next/navigation";
import { RouteType } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GiProgression } from "react-icons/gi";
import { FaEdit, FaHistory } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { useBlock } from "@/app/layoutContainer/BlockProvider";
import styles from "./footer.module.css";

export const Footer = () => {
  const pathname = usePathname();
  const { curUser } = useUser();
  const { curBlock, setTemplateBlock, setEditingWeekIdx } = useBlock();

  const [isStandalone, setIsStandalone] = useState(true);
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleIconClick = (route: string) => {
    if (!pathname.includes(route)) {
      if (route === RouteType.Add && curBlock) {
        setTemplateBlock(curBlock);
        setEditingWeekIdx(curBlock.curWeekIdx);
      }
    }
  };

  const navButtonMap = [
    { route: RouteType.Progress, icon: <GiProgression />, isHome: false },
    { route: RouteType.History, icon: <FaHistory />, isHome: false },
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
    { route: RouteType.Add, icon: <FaEdit />, isHome: false },
    { route: RouteType.Settings, icon: <IoSettingsSharp />, isHome: false },
  ];

  return (
    <>
      {pathname !== "/" && curUser && (
        <div
          className={styles.containerAnimate}
          style={{
            width: "100%",
            background: "#131314",
            height: "75px",
            zIndex: 10,
            borderRadius: "20px 20px 0 0",
            transform: `translateY(${isStandalone ? "0px" : "0px"})`,
          }}
        >
          <div
            className="d-flex justify-content-around align-items-center"
            style={{ width: "95%", height: "55px", margin: "0 auto" }}
          >
            {navButtonMap.map((button, idx) => (
              <Link
                key={idx}
                style={{
                  width: button.route === RouteType.Home ? "60px" : "50px",
                  fontSize: "28px",
                }}
                className={`${
                  pathname.includes(button.route)
                    ? styles.activeIcon
                    : styles.inactiveIcon
                } d-flex justify-content-center align-items-center`}
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
