import { useClearTimerEnd, useMe, useTimerEnd } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { useSnackbar } from "../providers/SnackbarProvider";
import type { RootStackParamList } from "../RootNavigator/types";
import { FONT, RADIUS, SPACING } from "../theme";

export const useTimerCountdown = () => {
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const { trigger: triggerClearTimerEnd } = useClearTimerEnd();
  const { showSnackbar } = useSnackbar();

  const timerEnd = useMemo(() => {
    const raw = timerEndData?.timerEnd;
    if (!raw) return undefined;
    return raw instanceof Date ? raw : new Date(raw);
  }, [timerEndData?.timerEnd]);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    if (!timerEnd) return;
    setCurrentTime(new Date());
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, [timerEnd]);

  const secondsLeft = timerEnd
    ? Math.max(
        0,
        Math.floor((timerEnd.getTime() - currentTime.getTime()) / 1000),
      )
    : 0;

  const timeString = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    return `${mins} : ${secs}`;
  }, [secondsLeft]);

  const clearTimer = useCallback(async () => {
    if (!curUser?._id) return;
    try {
      await triggerClearTimerEnd(curUser._id);
    } catch {
      showSnackbar("Failed to hide timer.", "error");
    }
  }, [curUser?._id, triggerClearTimerEnd, showSnackbar]);

  return {
    timerEnd,
    isActive: !!timerEnd,
    isDone: !!timerEnd && secondsLeft === 0,
    timeString,
    clearTimer,
  };
};

export const HeaderTimer = () => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isActive, timeString } = useTimerCountdown();

  if (!isActive) return null;

  const tint = colors.onPrimaryContainer;

  return (
    <TouchableRipple
      borderless
      accessibilityRole="button"
      accessibilityLabel="Open workout"
      onPress={() => navigation.navigate("CompleteSession")}
      style={{ borderRadius: RADIUS.pill }}
    >
      <View
        style={{
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        }}
      >
        <Text
          style={{
            fontSize: FONT.sm,
            fontWeight: "600",
            color: tint,
            fontVariant: ["tabular-nums"],
          }}
        >
          {timeString}
        </Text>
      </View>
    </TouchableRipple>
  );
};
