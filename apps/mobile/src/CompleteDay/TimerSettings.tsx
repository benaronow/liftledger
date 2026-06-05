import { Ionicons } from "@expo/vector-icons";
import { TimerPresets } from "@liftledger/shared";
import {
  useMe,
  useSetTimerEnd,
  useTimerPresets,
  useUpdateTimerPresets,
} from "@liftledger/api-client";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { LabeledSelect } from "../components/inputs";
import { SPACING } from "../theme";

const TIME_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

const cellStyle = { flex: 1 };

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
    setPresetsState({ ...presetsState, [idx]: totalSeconds });
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

  if (!curUser || !presetsState) return null;

  return (
    <View style={{ width: "100%", gap: SPACING.md, paddingVertical: SPACING.xs }}>
      {Object.values(presetsState).map((preset, idx) => {
        const presetMins = Math.floor(preset / 60)
          .toString()
          .padStart(2, "0");
        const presetSecs = (preset % 60).toString().padStart(2, "0");
        const isEditing = presetEditIdx === idx;
        return (
          <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }} key={idx}>
            {isEditing ? (
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: SPACING.xs, paddingHorizontal: SPACING.xs, backgroundColor: "white", borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
                <View style={cellStyle}>
                  <LabeledSelect
                    value={presetMins}
                    options={TIME_OPTIONS}
                    onChange={(value) =>
                      updatePresetsState(
                        idx,
                        parseInt(value) * 60 + (preset % 60),
                      )
                    }
                  />
                </View>
                <Text style={{ color: "black", fontWeight: "700" }}>:</Text>
                <View style={cellStyle}>
                  <LabeledSelect
                    value={presetSecs}
                    options={TIME_OPTIONS}
                    onChange={(value) =>
                      updatePresetsState(
                        idx,
                        Math.floor(preset / 60) * 60 + parseInt(value),
                      )
                    }
                  />
                </View>
              </View>
            ) : (
              <View style={cellStyle}>
                <ActionButton
                  label={`${presetMins} : ${presetSecs}`}
                  icon={null}
                  onPress={() => {
                    startTimer(preset);
                    onTimerStarted();
                  }}
                  variant="primaryInverted"
                  roundedSide="start"
                />
              </View>
            )}
            <ActionButton
              icon={
                <Ionicons
                  name={isEditing ? "save" : "create"}
                  size={18}
                  color="white"
                />
              }
              onPress={() => {
                if (isEditing) {
                  savePresets();
                  setPresetEditIdx(undefined);
                } else {
                  setPresetEditIdx(idx);
                }
              }}
              width={40}
              roundedSide="end"
            />
          </View>
        );
      })}
    </View>
  );
};
