"use client";

import { usePathname, useRouter } from "next/navigation";
import { makeStyles } from "tss-react/mui";
import {
  AddCircleOutline,
  History,
  HomeOutlined,
  InsightsRounded,
  PersonOutline,
} from "@mui/icons-material";
import { RouteType } from "@/types";

const useStyles = makeStyles()({
  footer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "white",
    height: "70px",
  },
  createBlockButton: {
    marginTop: "-10px",
    border: "solid",
    borderRadius: "5px",
    borderColor: "white",
    borderWidth: "2px",
    background: "#0096FF",
    color: "white",
    fontFamily: "Gabarito",
    fontSize: "16px",
    height: "35px",
  },
  cancelButton: {
    background: "red",
  },
  disabledButton: {
    background: "#9ed7ff",
  },
  disabledCancel: {
    background: "#ff8888",
  },
  icon: {
    color: "#a3258c",
    fontSize: "40px",
  },
  addIcon: {
    color: "#a3258c",
    fontSize: "35px",
  },
});

export const Footer = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const pathname = usePathname();

  const handleIconClick = (type: RouteType) => {
    router.push(type);
  };

  return (
    <>
      {pathname !== "/" && (
        <div className={classes.footer}>
          <div onClick={() => handleIconClick(RouteType.Progress)}>
            <InsightsRounded className={classes.icon}></InsightsRounded>
          </div>
          <div onClick={() => handleIconClick(RouteType.History)}>
            <History className={classes.icon}></History>
          </div>
          <div onClick={() => handleIconClick(RouteType.Home)}>
            <HomeOutlined className={classes.icon}></HomeOutlined>
          </div>
          <div onClick={() => handleIconClick(RouteType.Add)}>
            <AddCircleOutline className={classes.addIcon}></AddCircleOutline>
          </div>
          <div onClick={() => handleIconClick(RouteType.Profile)}>
            <PersonOutline className={classes.icon}></PersonOutline>
          </div>
        </div>
      )}
    </>
  );
};
