import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  useTimerSettings,
  useUpdateTimerSettings,
} from "@liftledger/api-client";
import type { TimerAlarm } from "@liftledger/shared";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { AppTextInput } from "../../../components/inputs";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, RADIUS, SPACING } from "../../../theme";

type NamedAlarm = Exclude<TimerAlarm, "none">;

const ALARM_SAMPLES: Record<NamedAlarm, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_1: require("../../../../assets/alarm_1_sample.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_2: require("../../../../assets/alarm_2_sample.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_3: require("../../../../assets/alarm_3_sample.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_4: require("../../../../assets/alarm_4_sample.wav"),
};

const ALARM_OPTIONS: { id: TimerAlarm; label: string }[] = [
  { id: "alarm_1", label: "Alarm 1" },
  { id: "alarm_2", label: "Alarm 2" },
  { id: "alarm_3", label: "Alarm 3" },
  { id: "alarm_4", label: "Alarm 4" },
  { id: "none", label: "None" },
];

const labelForAlarm = (alarm: TimerAlarm) =>
  ALARM_OPTIONS.find((o) => o.id === alarm)?.label ?? "Alarm 1";

export const AlarmSoundSelect = () => {
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const { data: timerSettingsData } = useTimerSettings();
  const { send: triggerUpdateTimerSettings } = useUpdateTimerSettings();

  const alarm = timerSettingsData?.timerSettings?.alarm ?? "alarm_1";

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TimerAlarm>(alarm);
  const [saving, setSaving] = useState(false);
  const [playingId, setPlayingId] = useState<TimerAlarm | null>(null);

  const player = useAudioPlayer(null);
  const { didJustFinish } = useAudioPlayerStatus(player);

  useEffect(() => {
    if (didJustFinish) setPlayingId(null);
  }, [didJustFinish]);

  const stopSample = () => {
    player.pause();
    setPlayingId(null);
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
  };

  const playSample = (id: TimerAlarm) => {
    if (id === "none") return;
    if (playingId === id) {
      stopSample();
      return;
    }
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.replace(ALARM_SAMPLES[id]);
    player.seekTo(0).catch(() => {});
    player.play();
    setPlayingId(id);
  };

  const openModal = () => {
    setDraft(alarm);
    setOpen(true);
  };

  const closeModal = () => {
    stopSample();
    setOpen(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await triggerUpdateTimerSettings({ patch: { alarm: draft } });
      closeModal();
    } catch {
      showSnackbar("Failed to update timer sound.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <View>
        <View pointerEvents="none">
          <AppTextInput
            label="Timer sound"
            value={labelForAlarm(alarm)}
            editable={false}
          />
        </View>
        <Pressable style={StyleSheet.absoluteFill} onPress={openModal} />
      </View>
      <ConfirmationDialog
        open={open}
        onClose={closeModal}
        title="Timer Sound"
        action="Save"
        onConfirm={save}
        confirming={saving}
      >
        <View style={{ gap: SPACING.md, width: "100%" }}>
          {ALARM_OPTIONS.map((opt) => {
            const selected = draft === opt.id;
            const playable = opt.id !== "none";
            return (
              <View
                key={opt.id}
                style={{
                  flexDirection: "row",
                  alignItems: "stretch",
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: selected
                    ? colors.primary
                    : colors.surfaceVariant,
                  backgroundColor: selected
                    ? colors.primaryContainer
                    : colors.background,
                  overflow: "hidden",
                }}
              >
                <Pressable
                  onPress={() => setDraft(opt.id)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: SPACING.md,
                    padding: SPACING.md,
                  }}
                >
                  <MaterialCommunityIcons
                    name={selected ? "radiobox-marked" : "radiobox-blank"}
                    size={22}
                    color={selected ? colors.primary : colors.onSurfaceDisabled}
                  />
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontSize: FONT.base,
                      fontWeight: selected ? "700" : "500",
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
                {playable && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Preview ${opt.label}`}
                    onPress={() => playSample(opt.id)}
                    style={{
                      width: 52,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surfaceVariant,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={playingId === opt.id ? "stop" : "play"}
                      size={24}
                      color={selected ? colors.onPrimary : colors.onSurface}
                    />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ConfirmationDialog>
    </>
  );
};
