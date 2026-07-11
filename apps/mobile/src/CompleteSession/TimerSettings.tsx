import { TimerPresets } from "@liftledger/shared";
import {
  useMe,
  useSetTimerEnd,
  useTimerSettings,
  useUpdateTimerSettings,
} from "@liftledger/api-client";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, IconButton, useTheme } from "react-native-paper";
import { TimePicker } from "../components/TimePicker";
import { FONT, RADIUS, SPACING } from "../theme";

const cellStyle = { flex: 1 };

interface Props {
  // Fired after a preset is clicked and the timer is started — gives the
  // host (a dialog, the post-set transition, etc.) a hook to dismiss itself.
  onTimerStarted: () => void;
}

export const TimerSettings = ({ onTimerStarted }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: timerSettingsData } = useTimerSettings();
  const { send: triggerUpdateTimerSettings } = useUpdateTimerSettings();
  const { send: triggerSetTimerEnd } = useSetTimerEnd();

  const settings = timerSettingsData?.timerSettings;
  const presets = settings?.presets;

  const savePresets = (next: TimerPresets) => {
    triggerUpdateTimerSettings({ patch: { presets: next } });
  };

  const [presetsState, setPresetsState] = useState<TimerPresets | undefined>(
    () => presets,
  );
  const [presetEditIdx, setPresetEditIdx] = useState<number>();

  useEffect(() => {
    if (presets) setPresetsState(presets);
  }, [presets]);

  const updatePresetsState = (idx: number, totalSeconds: number) => {
    setPresetsState((prev) => prev && { ...prev, [idx]: totalSeconds });
  };

  const startTimer = (totalSeconds: number) => {
    if (!curUser?._id) return;
    const endTime = new Date(new Date().getTime() + totalSeconds * 1000);
    triggerSetTimerEnd(endTime);
  };

  if (!curUser || !presetsState) return null;

  return (
    <View
      style={{ width: "100%", gap: SPACING.md, paddingVertical: SPACING.xs }}
    >
      {Object.values(presetsState).map((preset, idx) => {
        const presetMins = Math.floor(preset / 60)
          .toString()
          .padStart(2, "0");
        const presetSecs = (preset % 60).toString().padStart(2, "0");
        const isEditing = presetEditIdx === idx;
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
            }}
            key={idx}
          >
            {isEditing ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.xs,
                  paddingHorizontal: SPACING.xs,
                  backgroundColor: "white",
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                }}
              >
                <TimePicker
                  totalSeconds={preset}
                  onChange={(value) => updatePresetsState(idx, value)}
                />
              </View>
            ) : (
              <View style={cellStyle}>
                <Button
                  mode="contained"
                  buttonColor="white"
                  textColor={colors.primary}
                  onPress={() => {
                    startTimer(preset);
                    onTimerStarted();
                  }}
                  style={{
                    borderTopLeftRadius: RADIUS.md,
                    borderBottomLeftRadius: RADIUS.md,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  contentStyle={{ height: 35 }}
                  labelStyle={{
                    fontWeight: "700",
                    fontSize: FONT.base,
                    marginVertical: 0,
                    letterSpacing: 0,
                  }}
                >
                  {`${presetMins} : ${presetSecs}`}
                </Button>
              </View>
            )}
            <IconButton
              mode="contained"
              icon={isEditing ? "content-save" : "pencil"}
              size={18}
              containerColor={colors.primary}
              iconColor="white"
              style={{
                width: 40,
                height: 35,
                margin: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: RADIUS.md,
                borderBottomRightRadius: RADIUS.md,
              }}
              onPress={() => {
                if (isEditing) {
                  savePresets(presetsState);
                  setPresetEditIdx(undefined);
                } else {
                  setPresetEditIdx(idx);
                }
              }}
            />
          </View>
        );
      })}
    </View>
  );
};
