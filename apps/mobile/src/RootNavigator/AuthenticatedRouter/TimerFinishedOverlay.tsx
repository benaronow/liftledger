import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, useTheme } from "react-native-paper";
import { useTimerCountdown } from "../../components/Timer";
import { navigationRef } from "../navigationRef";
import { FONT, SPACING } from "../../theme";

export const TimerFinishedOverlay = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isDone, timerEnd, clearTimer } = useTimerCountdown();

  const mountedAt = useRef(Date.now());
  const [visible, setVisible] = useState(false);
  const prevDone = useRef(isDone);
  useEffect(() => {
    const finishedLive = !!timerEnd && timerEnd.getTime() > mountedAt.current;
    if (isDone && !prevDone.current && finishedLive) {
      setVisible(true);
      clearTimer();
    }
    prevDone.current = isDone;
  }, [isDone, timerEnd, clearTimer]);

  if (!visible) return null;

  const onCompleteDay =
    navigationRef.isReady() &&
    navigationRef.getCurrentRoute()?.name === "CompleteSession";

  const goToWorkout = () => {
    setVisible(false);
    navigationRef.navigate("CompleteSession");
  };

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
        onPress={() => setVisible(false)}
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
