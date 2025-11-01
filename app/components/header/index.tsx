"use client";

import { usePathname, useRouter } from "next/navigation";
import { RouteType } from "@/lib/types";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useUser } from "@/app/providers/UserProvider";
import { useBlock } from "@/app/providers/BlockProvider";
import styles from "./header.module.css";
import { Avatar } from "@mui/material";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useUser();
  const { curBlock } = useBlock();
  const { toggleScreenState } = useScreenState();

  const getTitle = () => {
    if (pathname.includes(RouteType.Signup)) return "Create Account";
    if (pathname.includes(RouteType.Progress)) return "Progress";
    if (pathname.includes(RouteType.History)) return "History";
    if (pathname.includes(RouteType.Add))
      return curBlock ? "Edit Block" : "Create Block";
    if (pathname.includes(RouteType.Settings)) return "Settings";
    if (pathname.includes(RouteType.Profile)) return "Profile";
    if (pathname.includes(RouteType.Workout)) return "Workout";
    return "Home";
  };

  return (
    <>
      {pathname !== "/" && session && (
        <div
          className={`${styles.containerAnimate} d-flex align-items-center`}
          style={{
            background: "#131314",
            height: "50px",
            width: "100%",
            zIndex: 10,
            borderRadius: "0 0 20px 20px",
          }}
        >
          <div
            className="d-flex"
            style={{ width: "50%", justifyContent: "flex-start" }}
          >
            <span
              className="text-white text-nowrap"
              style={{
                fontSize: "25px",
                fontFamily: "Mina",
                fontWeight: 700,
                marginLeft: "15px",
                height: "35px",
                borderRadius: "17.5px",
              }}
            >
              {getTitle()}
            </span>
          </div>
          <div
            className="d-flex align-items-center"
            style={{ width: "50%", justifyContent: "flex-end" }}
          >
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                marginRight: "10px",
                height: "32px",
                width: "32px",
                borderRadius: "16px",
                background: "white",
                color: "#6d6e71",
                cursor: "pointer",
              }}
              onClick={() => {
                toggleScreenState("fetching", true);
                router.push("/profile");
              }}
            >
              <Avatar
                sx={{ height: "32px", width: "32px" }}
                src={session?.user.picture}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
