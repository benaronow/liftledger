"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ActionDialog, DialogAction } from "./ActionDialog";
import { LabeledInput } from "./LabeledInput";
import { FaPlay } from "react-icons/fa";
import { useTimer } from "../providers/TimerProvider";
import { COLORS } from "@/lib/colors";
import { IoIosArrowForward, IoMdClose } from "react-icons/io";
import { RiTimerLine } from "react-icons/ri";

const TIME_OPTIONS = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
];
type TimeOption = (typeof TIME_OPTIONS)[number];

export const Timer = () => {
  const {
    timerEnd,
    setTimer,
    unsetTimer,
    timerOpen,
    setTimerOpen,
    timerDialogOpen,
    setTimerDialogOpen,
  } = useTimer();
  const [seconds, setSeconds] = useState<TimeOption>("00");
  const [minutes, setMinutes] = useState<TimeOption>("00");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setMinutes("00");
    setSeconds("00");
  }, [timerDialogOpen]);

  const setTimerEnd = () => {
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    const endTime = new Date(new Date().getTime() + totalSeconds * 1000);
    setTimer(endTime);
  };

  const timeString = useMemo(() => {
    if (!timerEnd) return "00 : 00";

    const totalSeconds = Math.max(
      0,
      Math.floor((new Date(timerEnd).getTime() - currentTime.getTime()) / 1000)
    );
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mins} : ${secs}`;
  }, [timerEnd, currentTime]);

  const timerActions: DialogAction[] = [
    {
      icon: <FaPlay fontSize={24} />,
      onClick: () => {
        setTimerEnd();
        setTimerDialogOpen(false);
      },
      variant: "primary",
    },
  ];

  const changeTime = (
    e: ChangeEvent<HTMLSelectElement>,
    type: "minutes" | "seconds"
  ) => {
    if (type === "minutes") setMinutes(e.target.value as TimeOption);
    if (type === "seconds") setSeconds(e.target.value as TimeOption);
  };

  return (
    <>
      {timerEnd && (
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
          {timerOpen ? (
            <>
              <button
                className="h-100 border-0 rounded-start text-white d-flex align-items-center justify-content-center p-2"
                style={{
                  width: "50px",
                  height: "50px",
                  background: COLORS.primary,
                }}
                onClick={() => setTimerOpen(false)}
              >
                <IoIosArrowForward fontSize={28} />
              </button>
              <strong className="text-white fs-4 text-nowrap">
                {timeString}
              </strong>
              <button
                className="h-100 border-0 rounded-end text-white d-flex align-items-center justify-content-center p-2"
                style={{
                  width: "50px",
                  height: "50px",
                  background: COLORS.danger,
                }}
                onClick={unsetTimer}
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
              onClick={() => setTimerOpen(true)}
            >
              <RiTimerLine fontSize={28} />
            </button>
          )}
        </div>
      )}
      {timerDialogOpen && (
        <ActionDialog
          open={timerDialogOpen}
          onClose={() => setTimerDialogOpen(false)}
          title="Start Timer"
          actions={timerActions}
        >
          <div className="d-flex gap-1 align-items-end py-2 px-4">
            <LabeledInput
              label="Minutes"
              textValue={minutes}
              options={TIME_OPTIONS}
              onChangeSelect={(e) => changeTime(e, "minutes")}
            />
            <strong className="text-white fs-3">:</strong>
            <LabeledInput
              label="Seconds"
              textValue={seconds}
              options={TIME_OPTIONS}
              onChangeSelect={(e) => changeTime(e, "seconds")}
            />
          </div>
        </ActionDialog>
      )}
    </>
  );
};
