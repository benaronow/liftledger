"use client";

import { usePathname, useRouter } from "next/navigation";
import { useContext } from "react";
import { makeStyles } from "tss-react/mui";
import { LoginContext } from "../providers/loginContext";

const useStyles = makeStyles()({
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#a3258c",
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
});

export const Footer = () => {
  const { classes } = useStyles();
  const { curUser } = useContext(LoginContext);
  const router = useRouter();
  const pathname = usePathname();

  const handleCreateClick = () => {
    router.push("/create-block");
  };

  const handleCancelClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className={classes.footer}>
      <button
        className={`${classes.createBlockButton} ${
          pathname.includes("/create-block") && classes.cancelButton
        } ${
          pathname.includes("/create-block")
            ? !curUser && classes.disabledCancel
            : !curUser && classes.disabledButton
        }`}
        onClick={
          pathname.includes("/create-block")
            ? handleCancelClick
            : handleCreateClick
        }
        disabled={!curUser}
      >
        {pathname.includes("/create-block") ? "Cancel" : "Create New Block"}
      </button>
    </div>
  );
};
