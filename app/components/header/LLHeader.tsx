"use client";

import { Avatar } from "@mui/material";
import Image from "next/image";
import { makeStyles } from "tss-react/mui";
import { ProfileModal } from "./profileModal";
import { useState } from "react";
import { SessionData } from "@auth0/nextjs-auth0/server";

const useStyles = makeStyles()({
  header: {
    display: "flex",
    background: "#a3258c",
    justifyContent: "center",
    alignItems: "center",
    height: '60px',
  },
  logoContainer: {
    display: "flex",
    flex: "1",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    marginLeft: "7.5px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: "30px",
    fontFamily: "Mina",
    fontWeight: "700",
  },
  avatarContainer: {
    display: "flex",
    flex: "1",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  avatar: {
    height: "40px",
    width: "40px",
    marginRight: "7.5px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  modalContainer: {},
});

interface LLHeaderProps {
  session: SessionData | null;
}

export const LLHeader = ({ session }: LLHeaderProps) => {
  const { classes } = useStyles();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleAvatarClick = () => {
    setProfileModalOpen(true);
  };

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
  };

  return (
    <>
      <div className={classes.header}>
        <div className={classes.logoContainer}>
          <Image
            className={classes.logo}
            src="/icon.png"
            alt="Description of image"
            height={40}
            width={40}
          />
        </div>
        <div className={classes.titleContainer}>
          <span className={classes.title}>liftledger</span>
        </div>
        <div className={classes.avatarContainer} onClick={handleAvatarClick}>
          <Avatar className={classes.avatar} />
        </div>
      </div>
      <ProfileModal
        open={profileModalOpen}
        onClose={handleProfileModalClose}
        session={session}
      ></ProfileModal>
    </>
  );
};
