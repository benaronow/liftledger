import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, useTheme } from "react-native-paper";
import {
  ensureTimerNotificationSetup,
  useRestTimerNotification,
  useTimerAlarm,
  useTimerCountdown,
} from "./TimerCountdownProvider";
import { navigationRef } from "../navigationRef";
import { FONT, SPACING } from "../../theme";

export const TimerFinishedOverlay = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isDone, timerEnd, clearTimer } = useTimerCountdown();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [backgroundedDuringTimer, setBackgroundedDuringTimer] = useState(false);
  const mountedAtTime = useMemo(() => Date.now(), []);

  const goToCompleteSession = () => {
    if (navigationRef.isReady()) navigationRef.navigate("CompleteSession");
  };

  const onCompleteDay =
    navigationRef.isReady() &&
    navigationRef.getCurrentRoute()?.name === "CompleteSession";

  const dismiss = useCallback(() => {
    setOverlayVisible(false);
    clearTimer();
  }, [clearTimer]);

  const goToWorkout = useCallback(() => {
    dismiss();
    goToCompleteSession();
  }, [dismiss]);

  useTimerAlarm(overlayVisible);
  useRestTimerNotification();

  useEffect(() => {
    ensureTimerNotificationSetup();
  }, []);

  useEffect(() => {
    if (timerEnd && timerEnd.getTime() > Date.now()) {
      setBackgroundedDuringTimer(false);
    }
  }, [timerEnd]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background") {
        setBackgroundedDuringTimer(true);
      } else if (
        next === "active" &&
        timerEnd &&
        timerEnd.getTime() > Date.now()
      ) {
        setBackgroundedDuringTimer(false);
      }
    });

    return () => sub.remove();
  }, [timerEnd]);

  useEffect(() => {
    if (!isDone || !timerEnd) return;

    const finishedWhileAway =
      timerEnd.getTime() < mountedAtTime || backgroundedDuringTimer;

    if (!finishedWhileAway) {
      setOverlayVisible(true);
    } else {
      setOverlayVisible(false);
      clearTimer();
      goToCompleteSession();
    }
  }, [isDone, timerEnd, clearTimer, mountedAtTime, backgroundedDuringTimer]);

  if (!overlayVisible) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 1000,
          elevation: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          alignItems: "center",
          justifyContent: "center",
          padding: SPACING.xl,
          gap: SPACING.xl,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={dismiss}
        hitSlop={16}
        style={{
          position: "absolute",
          top: insets.top + SPACING.sm,
          right: SPACING.lg,
        }}
      >
        <MaterialCommunityIcons name="close" size={40} color="white" />
      </Pressable>
      <Text
        style={{
          color: "white",
          fontSize: 34,
          fontWeight: "800",
          textAlign: "center",
        }}
      >
        Timer finished
      </Text>
      {!onCompleteDay && (
        <Button
          mode="contained"
          buttonColor={colors.secondary}
          textColor={colors.onSecondary}
          onPress={goToWorkout}
          contentStyle={{
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.md,
          }}
          labelStyle={{ fontSize: FONT.lg }}
        >
          Start next set
        </Button>
      )}
    </View>
  );
};
