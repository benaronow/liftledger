"use client";

import { useEffect, useMemo, useState } from "react";
import { useClearTimerEnd, useMe, useTimerEnd } from "@liftledger/api-client";
import { COLORS } from "@/lib/colors";
import { IoIosArrowForward, IoMdClose } from "react-icons/io";
import { RiTimerLine } from "react-icons/ri";

// Floating countdown that lives in the layout. Opening the timer-settings
// dialog is the responsibility of whichever component wants to trigger it
// (e.g. CompleteDayFooter, SubmitSetDialog) — they render their own
// <TimerSettingsDialog>.
export const Timer = () => {
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const { trigger: triggerClearTimerEnd } = useClearTimerEnd();

  const timerEnd = useMemo(() => {
    const raw = timerEndData?.timerEnd;
    if (!raw) return undefined;
    return raw instanceof Date ? raw : new Date(raw);
  }, [timerEndData?.timerEnd]);

  const [open, setOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const timeString = useMemo(() => {
    if (!timerEnd) return "00 : 00";

    const totalSeconds = Math.max(
      0,
      Math.floor((timerEnd.getTime() - currentTime.getTime()) / 1000),
    );
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins} : ${secs}`;
  }, [timerEnd, currentTime]);

  if (!timerEnd) return null;

  return (
    <div
      className="position-absolute d-flex align-items-center justify-content-center rounded end-0 me-3 gap-2"
      style={{
        background: COLORS.container,
        boxShadow: "0px 0px 15px #131314",
        top: "60px",
        height: "50px",
        zIndex: 100,
      }}
    >
      {open ? (
        <>
          <button
            className="h-100 border-0 rounded-start text-white d-flex align-items-center justify-content-center p-2"
            style={{
              width: "50px",
              height: "50px",
              background: COLORS.primary,
            }}
            onClick={() => setOpen(false)}
          >
            <IoIosArrowForward fontSize={28} />
          </button>
          <strong className="text-white fs-4 text-nowrap">{timeString}</strong>
          <button
            className="h-100 border-0 rounded-end text-white d-flex align-items-center justify-content-center p-2"
            style={{
              width: "50px",
              height: "50px",
              background: COLORS.danger,
            }}
            onClick={() => curUser?._id && triggerClearTimerEnd(curUser._id)}
          >
            <IoMdClose fontSize={28} />
          </button>
        </>
      ) : (
        <button
          className="h-100 border-0 rounded text-white d-flex align-items-center justify-content-center p-2"
          style={{
            width: "50px",
            height: "50px",
            background:
              timeString === "00 : 00" ? COLORS.success : COLORS.primary,
          }}
          onClick={() => setOpen(true)}
        >
          <RiTimerLine fontSize={28} />
        </button>
      )}
    </div>
  );
};
