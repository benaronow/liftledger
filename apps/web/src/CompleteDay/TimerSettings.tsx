import { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import {
  useMe,
  useSetTimerEnd,
  useTimerPresets,
  useUpdateTimerPresets,
} from "@liftledger/api-client";
import type { TimerPresets } from "@liftledger/shared";
import { ActionButton } from "@/components/ActionButton";
import { BiSolidEdit } from "react-icons/bi";
import { LabeledSelect } from "@/components/inputs";

const TIME_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

interface Props {
  // Fired after a preset is clicked and the timer is started — gives the
  // host (a dialog, the post-set transition, etc.) a hook to dismiss itself.
  onTimerStarted: () => void;
}

export const TimerSettings = ({ onTimerStarted }: Props) => {
  const { data: curUser } = useMe();
  const { data: timerPresetsData } = useTimerPresets(curUser?._id);
  const { trigger: triggerSetTimerEnd } = useSetTimerEnd();
  const { trigger: triggerUpdateTimerPresets } = useUpdateTimerPresets();

  const [presetsState, setPresetsState] = useState<{ [key: number]: number }>();
  const [presetEditIdx, setPresetEditIdx] = useState<number>();

  useEffect(() => {
    setPresetsState(
      timerPresetsData?.timerPresets as unknown as
        | { [key: number]: number }
        | undefined,
    );
  }, [timerPresetsData?.timerPresets]);

  const updatePresetsState = (idx: number, totalSeconds: number) => {
    const newPresets = { ...presetsState, [idx]: totalSeconds };
    setPresetsState(newPresets);
  };

  const startTimer = (totalSeconds: number) => {
    if (!curUser?._id) return;
    const endTime = new Date(new Date().getTime() + totalSeconds * 1000);
    triggerSetTimerEnd({ userId: curUser._id, timerEnd: endTime });
  };

  const savePresets = () => {
    if (!curUser?._id || !presetsState) return;
    triggerUpdateTimerPresets({
      userId: curUser._id,
      timerPresets: presetsState as unknown as TimerPresets,
    });
  };

  return (
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
                  <LabeledSelect
                    value={presetMins}
                    options={TIME_OPTIONS}
                    onChange={(e) =>
                      updatePresetsState(
                        idx,
                        parseInt(e.target.value) * 60 + (preset % 60),
                      )
                    }
                    height={35}
                  />
                  <span>:</span>
                  <LabeledSelect
                    value={presetSecs}
                    options={TIME_OPTIONS}
                    onChange={(e) =>
                      updatePresetsState(
                        idx,
                        Math.floor(preset / 60) * 60 +
                          parseInt(e.target.value),
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
                    startTimer(preset);
                    onTimerStarted();
                  }}
                  variant="primaryInverted"
                  roundedSide="start"
                />
              )}
              <ActionButton
                icon={presetEditIdx === idx ? <FaSave /> : <BiSolidEdit />}
                onClick={() => {
                  if (presetEditIdx === idx) {
                    savePresets();
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
  );
};
