"use client";

import {
  selectMessageOpen,
  setMessageOpen,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Close, IosShare, MoreVert } from "@mui/icons-material";
import { Box, Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { useMessageModalStyles } from "./useMessageModalStyles";

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
  const { classes } = useMessageModalStyles();
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
