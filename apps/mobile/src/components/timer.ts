import { useClearTimerEnd, useTimerEnd } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useSnackbar } from "../providers/SnackbarProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REST_TIMER_CHANNEL_ID = "rest-timer";
const REST_TIMER_NOTIFICATION_TYPE = "rest-timer";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ALARM_SOUND = require("../../assets/alarm.wav");

export const ensureTimerNotificationSetup = async () => {
  try {
    const settings = await Notifications.getPermissionsAsync();
    const provisional =
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!settings.granted && !provisional) {
      await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });
    }
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(REST_TIMER_CHANNEL_ID, {
        name: "Rest timer",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500, 250, 500, 250, 500],
        sound: "alarm.wav",
      });
    }
  } catch {
    // Notifications are best-effort; the in-app overlay is the fallback.
  }
};

export const clearTimerNotifications = () =>
  Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

export const useRestTimerNotification = () => {
  const { data: timerEndData } = useTimerEnd();
  const scheduledIdRef = useRef<string | null>(null);

  const timerEnd = useMemo(() => {
    const raw = timerEndData?.timerEnd;
    if (!raw) return undefined;
    return raw instanceof Date ? raw : new Date(raw);
  }, [timerEndData?.timerEnd]);

  useEffect(() => {
    const prevId = scheduledIdRef.current;
    if (prevId) {
      Notifications.cancelScheduledNotificationAsync(prevId).catch(() => {});
      scheduledIdRef.current = null;
    }

    if (!timerEnd || timerEnd.getTime() <= Date.now()) return;

    let cancelled = false;
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Rest complete",
        body: "Time for your next set.",
        sound: "alarm.wav",
        data: { type: REST_TIMER_NOTIFICATION_TYPE },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: timerEnd,
        channelId: REST_TIMER_CHANNEL_ID,
      },
    })
      .then((id) => {
        if (cancelled) {
          Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
        } else {
          scheduledIdRef.current = id;
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [timerEnd]);
};

export const useTimerAlarm = (active: boolean) => {
  const player = useAudioPlayer(active ? ALARM_SOUND : null);
  const { isLoaded } = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!active || !isLoaded) return;

    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});

    player.loop = true;
    player.volume = 1;
    player.seekTo(0).catch(() => {});
    player.play();

    const buzz = () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
    buzz();
    const hapticInterval = setInterval(buzz, 800);

    return () => {
      clearInterval(hapticInterval);
      player.pause();
      setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: "mixWithOthers",
      }).catch(() => {});
    };
  }, [active, isLoaded, player]);
};

export const useTimerCountdown = () => {
  const { data: timerEndData } = useTimerEnd();
  const { send: triggerClearTimerEnd } = useClearTimerEnd();
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
    try {
      await triggerClearTimerEnd();
    } catch {
      showSnackbar("Failed to hide timer.", "error");
    }
  }, [triggerClearTimerEnd, showSnackbar]);

  return {
    timerEnd,
    isActive: !!timerEnd,
    isDone: !!timerEnd && secondsLeft === 0,
    timeString,
    clearTimer,
  };
};
