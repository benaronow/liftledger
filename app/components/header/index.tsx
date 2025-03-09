"use client";

import { usePathname, useRouter } from "next/navigation";
import { Person } from "@mui/icons-material";
import { selectEditingBlock } from "@/lib/features/user/userSlice";
import { RouteType } from "@/types";
import { useHeaderStyles } from "./useHeaderStyles";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";

export const Header = () => {
  const { classes } = useHeaderStyles();
  const router = useRouter();
  const pathname = usePathname();
  const editingBlock = useSelector(selectEditingBlock);
  const { toggleScreenState } = useContext(ScreenStateContext);

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

  return (
    <>
      {pathname !== "/" && (
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
