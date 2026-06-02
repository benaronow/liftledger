import { Ionicons } from "@expo/vector-icons";
import { COLORS, TimerPresets } from "@liftledger/shared";
import {
  useMe,
  useSetTimerEnd,
  useTimerPresets,
  useUpdateTimerPresets,
} from "@liftledger/api-client";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { LabeledSelect } from "../../components/inputs";
import { SPACING } from "../../theme";

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
    <View style={styles.body}>
      {Object.values(presetsState).map((preset, idx) => {
        const presetMins = Math.floor(preset / 60)
          .toString()
          .padStart(2, "0");
        const presetSecs = (preset % 60).toString().padStart(2, "0");
        const isEditing = presetEditIdx === idx;
        return (
          <View style={styles.row} key={idx}>
            {isEditing ? (
              <View style={styles.editFields}>
                <View style={styles.cell}>
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
                <Text style={styles.colon}>:</Text>
                <View style={styles.cell}>
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
              <View style={styles.cell}>
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

const styles = StyleSheet.create({
  body: { width: "100%", gap: SPACING.md, paddingVertical: SPACING.xs },
  row: { flexDirection: "row", alignItems: "center", width: "100%" },
  cell: { flex: 1 },
  editFields: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    backgroundColor: "white",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  colon: { color: "black", fontWeight: "700" },
});
