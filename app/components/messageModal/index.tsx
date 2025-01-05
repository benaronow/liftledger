"use client";

import {
  selectMessageOpen,
  setMessageOpen,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Close, IosShare, MoreVert } from "@mui/icons-material";
import { Box, Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  banner: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    height: "40px",
    background: "lightgray",
  },
  leftPad: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "50%",
  },
  rightPad: {
    width: "50%",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "League+Spartan",
    fontSize: "24px",
    fontWeight: 900,
  },
  close: {
    marginLeft: "5px",
    color: "red",
    fontSize: "20px",
    borderRadius: "7.5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  stepsContainer: {
    display: "flex",
    flexDirection: "column",
    height: "calc(85dvh - 40px)",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  shareIcon: {
    marginLeft: "5px",
    transform: "translateY(-2px)",
  },
  step: {
    fontFamily: "League+Spartan",
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "-20px",
  },
  step1Row: {
    marginBottom: "-20px",
  },
  os: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
  },
  descText: {
    padding: "0px 10px 0px 10px",
    textAlign: "center",
  },
  divider: {
    width: "95%",
    height: "2px",
    background: "black",
  },
});

const boxStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "85dvw",
  height: "85dvh",
  background: "white",
  outline: "none",
  transform: "translate(calc(50dvw - 50%), calc(50dvh - 50%))",
  borderRadius: "25px",
  border: "solid",
  borderColor: "lightgray",
  borderWidth: "5px",
  overflow: "hidden",
  paddingBottom: "10px",
};

export const MessageModal = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const open = useSelector(selectMessageOpen);
  const onClose = () => dispatch(setMessageOpen(false));

  const handleClose = () => dispatch(setMessageOpen(false));

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={boxStyle}>
        <div className={classes.banner}>
          <div className={classes.leftPad}>
            <div onClick={handleClose}>
              <Close className={classes.close} />
            </div>
          </div>
          <div className={classes.titleContainer}>
            <span className={classes.title}>Notice</span>
          </div>
          <div className={classes.rightPad}></div>
        </div>
        <div className={classes.stepsContainer}>
          <div className={classes.descText}>
            <span>
              Thank you for using LiftLedger! For the best mobile experience,
              please take the following steps.
            </span>
          </div>
          <div className={classes.divider} />
          <span className={classes.step}>Step 1</span>
          <span className={classes.step1Row}>Locate the following button</span>
          <div className={`${classes.buttonRow} ${classes.step1Row}`}>
            <span className={classes.os}>iOS Users:</span>
            <IosShare className={classes.shareIcon} />
          </div>
          <div className={classes.buttonRow}>
            <span className={classes.os}>Android Users:</span>
            <MoreVert />
          </div>
          <div className={classes.divider} />
          <span className={classes.step}>Step 2</span>
          <span>{`Click on "Add to home screen"`}</span>
          <div className={classes.divider} />
          <span className={classes.step}>Step 3</span>
          <span>Enjoy LiftLedger!</span>
        </div>
      </Box>
    </Modal>
  );
};
