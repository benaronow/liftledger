import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useClearTimerEnd, useMe, useTimerEnd } from "@liftledger/api-client";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, RADIUS, SPACING } from "../theme";

// Floating countdown that lives above the navigator so it persists across every
// authed screen (web mounted it in the global layout). Opening the timer-
// settings dialog is the responsibility of whichever screen wants to start a
// timer (CompleteDayFooter, SubmitSetDialog) — they render their own dialog.
export const Timer = () => {
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { top: insets.top + 50 }]}>
      {open ? (
        <>
          <Pressable
            style={[styles.button, styles.roundedStart, { backgroundColor: COLORS.primary }]}
            onPress={() => setOpen(false)}
          >
            <Ionicons name="chevron-forward" size={28} color="white" />
          </Pressable>
          <Text style={styles.time}>{timeString}</Text>
          <Pressable
            style={[styles.button, styles.roundedEnd, { backgroundColor: COLORS.danger }]}
            onPress={() => curUser?._id && triggerClearTimerEnd(curUser._id)}
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </>
      ) : (
        <Pressable
          style={[
            styles.button,
            styles.rounded,
            {
              backgroundColor:
                timeString === "00 : 00" ? COLORS.success : COLORS.primary,
            },
          ]}
          onPress={() => setOpen(true)}
        >
          <Ionicons name="timer-outline" size={28} color="white" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.container,
    zIndex: 100,
    // Drop shadow matching web's box-shadow over content.
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 12,
  },
  button: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  rounded: { borderRadius: RADIUS.md },
  roundedStart: {
    borderTopLeftRadius: RADIUS.md,
    borderBottomLeftRadius: RADIUS.md,
  },
  roundedEnd: {
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  time: { color: "white", fontWeight: "700", fontSize: FONT.lg },
});
