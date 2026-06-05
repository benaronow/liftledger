import { Ionicons } from "@expo/vector-icons";
import { useClearTimerEnd, useMe, useTimerEnd } from "@liftledger/api-client";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../providers/ThemeProvider";
import { FONT, RADIUS, SPACING } from "../theme";

const buttonStyle = {
  width: 50,
  height: 50,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

// Floating countdown that lives above the navigator so it persists across every
// authed screen (web mounted it in the global layout). Opening the timer-
// settings dialog is the responsibility of whichever screen wants to start a
// timer (CompleteDayFooter, SubmitSetDialog) — they render their own dialog.
export const Timer = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
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
    <View
      style={{
        position: "absolute",
        right: SPACING.md,
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        height: 50,
        borderRadius: RADIUS.md,
        zIndex: 100,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 15,
        elevation: 12,
        top: insets.top + 50,
        backgroundColor: colors.container,
        shadowColor: colors.dark,
      }}
    >
      {open ? (
        <>
          <Pressable
            style={{
              ...buttonStyle,
              borderTopLeftRadius: RADIUS.md,
              borderBottomLeftRadius: RADIUS.md,
              backgroundColor: colors.primary,
            }}
            onPress={() => setOpen(false)}
          >
            <Ionicons name="chevron-forward" size={28} color="white" />
          </Pressable>
          <Text style={{ color: "white", fontWeight: "700", fontSize: FONT.lg }}>{timeString}</Text>
          <Pressable
            style={{
              ...buttonStyle,
              borderTopRightRadius: RADIUS.md,
              borderBottomRightRadius: RADIUS.md,
              backgroundColor: colors.danger,
            }}
            onPress={() => curUser?._id && triggerClearTimerEnd(curUser._id)}
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </>
      ) : (
        <Pressable
          style={{
            ...buttonStyle,
            borderRadius: RADIUS.md,
            backgroundColor:
              timeString === "00 : 00" ? colors.success : colors.primary,
          }}
          onPress={() => setOpen(true)}
        >
          <Ionicons name="timer-outline" size={28} color="white" />
        </Pressable>
      )}
    </View>
  );
};
