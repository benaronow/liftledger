"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionDialog } from "./ActionDialog";
import { LabeledInput } from "./LabeledInput";
import { FaSave } from "react-icons/fa";
import { useTimer } from "../providers/TimerProvider";
import { COLORS } from "@/lib/colors";
import { IoIosArrowForward, IoMdClose } from "react-icons/io";
import { RiTimerLine } from "react-icons/ri";
import { useUser } from "../providers/UserProvider";
import { ActionButton } from "./ActionButton";
import { BiSolidEdit } from "react-icons/bi";

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

export const Timer = () => {
  const { curUser } = useUser();
  const {
    timerEnd,
    setTimer,
    unsetTimer,
    timerPresets,
    updateTimerPresets,
    timerOpen,
    setTimerOpen,
    timerDialogOpen,
    setTimerDialogOpen,
  } = useTimer();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [presetsState, setPresetsState] = useState<{ [key: number]: number }>();
  const [presetEditIdx, setPresetEditIdx] = useState<number>();

  useEffect(() => {
    setPresetsState(timerPresets);
  }, [timerPresets]);

  useEffect(() => {
    setPresetEditIdx(undefined);
  }, [timerDialogOpen]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const setTimerEnd = (totalSeconds: number) => {
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

  const updatePresetsState = (idx: number, totalSeconds: number) => {
    const newPresets = { ...presetsState, [idx]: totalSeconds };
    setPresetsState(newPresets);
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
          actions={[]}
        >
          <div className="w-100 d-flex flex-column gap-3 align-items-center py-2 px-4">
            {curUser &&
              presetsState &&
              Object.values(presetsState ?? {}).map((preset, idx) => {
                const presetMins = Math.floor(preset / 60)
                  .toString()
                  .padStart(2, "0");
                const presetSecs = (preset % 60).toString().padStart(2, "0");
                return (
                  <div className="d-flex w-100" key={idx}>
                    {presetEditIdx === idx ? (
                      <div className="w-100 d-flex gap-1 align-items-center bg-white rounded-start justify-content-center">
                        <LabeledInput
                          textValue={presetMins}
                          options={TIME_OPTIONS}
                          onChangeSelect={(e) =>
                            updatePresetsState(
                              idx,
                              parseInt(e.target.value) * 60 + (preset % 60)
                            )
                          }
                          height={35}
                        />
                        <span>:</span>
                        <LabeledInput
                          textValue={presetSecs}
                          options={TIME_OPTIONS}
                          onChangeSelect={(e) =>
                            updatePresetsState(
                              idx,
                              Math.floor(preset / 60) * 60 +
                                parseInt(e.target.value)
                            )
                          }
                          height={35}
                        />
                      </div>
                    ) : (
                      <ActionButton
                        label={`${presetMins} : ${presetSecs}`}
                        icon={null}
                        onClick={() => {
                          setTimerEnd(preset);
                          setTimerDialogOpen(false);
                        }}
                        variant="primaryInverted"
                        roundedSide="start"
                      />
                    )}
                    <ActionButton
                      icon={
                        presetEditIdx === idx ? <FaSave /> : <BiSolidEdit />
                      }
                      onClick={() => {
                        if (presetEditIdx === idx) {
                          updateTimerPresets(presetsState);
                          setPresetEditIdx(undefined);
                        } else {
                          setPresetEditIdx(idx);
                        }
                      }}
                      width={35}
                      roundedSide="end"
                    />
                  </div>
                );
              })}
          </div>
        </ActionDialog>
      )}
    </>
  );
};
