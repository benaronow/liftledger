"use client";

import { usePathname, useRouter } from "next/navigation";
import { Person } from "@mui/icons-material";
import { RouteType } from "@/app/types";
import { useHeaderStyles } from "./useHeaderStyles";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { useUser } from "@/app/providers/UserProvider";
import { useBlock } from "@/app/providers/BlockProvider";

export const Header = () => {
  const { classes } = useHeaderStyles();
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
        <div className={classes.container}>
          <div className={classes.leftPad}>
            <span className={classes.title}>{getTitle()}</span>
          </div>
          <div className={classes.rightPad}>
            <div
              className={classes.profileIcon}
              onClick={() => {
                toggleScreenState("fetching", true);
                router.push("/profile");
              }}
            >
              <Person className={classes.profileIconImg} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
