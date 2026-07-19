import {
  useClearTimerEnd,
  useTimerEnd,
  useTimerSettings,
} from "@liftledger/api-client";
import type { TimerAlarm } from "@liftledger/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useSnackbar } from "../../providers/SnackbarProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REST_TIMER_NOTIFICATION_TYPE = "rest-timer";

const ALARM_SOUNDS: Record<Exclude<TimerAlarm, "none">, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_1: require("../../../assets/alarm_1.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_2: require("../../../assets/alarm_2.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_3: require("../../../assets/alarm_3.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  alarm_4: require("../../../assets/alarm_4.wav"),
};

const channelIdForAlarm = (alarm: TimerAlarm) => `rest-timer-${alarm}`;
const soundFileForAlarm = (alarm: TimerAlarm) =>
  alarm === "none" ? null : `${alarm}.wav`;

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
      const alarms: TimerAlarm[] = [
        "alarm_1",
        "alarm_2",
        "alarm_3",
        "alarm_4",
        "none",
      ];
      await Promise.all(
        alarms.map((alarm) =>
          Notifications.setNotificationChannelAsync(channelIdForAlarm(alarm), {
            name: alarm === "none" ? "Rest timer (silent)" : "Rest timer",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 250, 500, 250, 500, 250, 500],
            sound: soundFileForAlarm(alarm),
          }),
        ),
      );
    }
  } catch {
    // Notifications are best-effort; the in-app overlay is the fallback.
  }
};

export const clearTimerNotifications = () =>
  Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

export const useRestTimerNotification = () => {
  const { data: timerEndData } = useTimerEnd();
  const { data: timerSettingsData } = useTimerSettings();
  const scheduledIdRef = useRef<string | null>(null);

  const settings = timerSettingsData?.timerSettings;
  const notify = settings?.notify ?? true;
  const alarm = settings?.alarm ?? "alarm_1";

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

    if (!notify || !timerEnd || timerEnd.getTime() <= Date.now()) return;

    const soundFile = soundFileForAlarm(alarm);

    let cancelled = false;
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Rest complete",
        body: "Time for your next set.",
        sound: soundFile ?? false,
        data: { type: REST_TIMER_NOTIFICATION_TYPE },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: timerEnd,
        channelId: channelIdForAlarm(alarm),
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
  }, [timerEnd, notify, alarm]);
};

export const useTimerAlarm = (active: boolean) => {
  const { data: timerSettingsData } = useTimerSettings();
  const alarm = timerSettingsData?.timerSettings?.alarm ?? "alarm_1";
  const soundActive = active && alarm !== "none";

  const player = useAudioPlayer(
    active && alarm !== "none" ? ALARM_SOUNDS[alarm] : null,
  );
  const { isLoaded } = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!soundActive || !isLoaded) return;

    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});

    player.loop = true;
    player.volume = 1;
    player.seekTo(0).catch(() => {});
    player.play();

    return () => {
      player.pause();
      setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: "mixWithOthers",
      }).catch(() => {});
    };
  }, [soundActive, isLoaded, player]);

  useEffect(() => {
    if (!active) return;

    const buzz = () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
    buzz();
    const hapticInterval = setInterval(buzz, 800);

    return () => clearInterval(hapticInterval);
  }, [active]);
};

type TimerCountdown = {
  timerEnd: Date | undefined;
  isActive: boolean;
  isDone: boolean;
  timeString: string;
  clearTimer: () => Promise<void>;
};

const TimerCountdownContext = createContext<TimerCountdown | null>(null);

// A single countdown shared by every timer surface (header pill, workout FAB,
// finished overlay). Each of those previously ran its own 1s setInterval; this
// runs exactly one, and stops it the moment the timer reaches zero rather than
// ticking every second forever until the timer is cleared.
export const TimerCountdownProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { data: timerEndData } = useTimerEnd();
  const { send: triggerClearTimerEnd } = useClearTimerEnd();
  const { showSnackbar } = useSnackbar();

  const timerEnd = useMemo(() => {
    const raw = timerEndData?.timerEnd;
    if (!raw) return undefined;
    return raw instanceof Date ? raw : new Date(raw);
  }, [timerEndData?.timerEnd]);

  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    if (!timerEnd) return;
    const now = new Date();
    setCurrentTime(now);
    // Already done — no reason to spin up a per-second interval for a timer
    // that has nothing left to count down.
    if (timerEnd.getTime() <= now.getTime()) return;
    const intervalId = setInterval(() => {
      const tick = new Date();
      setCurrentTime(tick);
      if (tick.getTime() >= timerEnd.getTime()) clearInterval(intervalId);
    }, 1000);
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

  const value = useMemo<TimerCountdown>(
    () => ({
      timerEnd,
      isActive: !!timerEnd,
      isDone: !!timerEnd && secondsLeft === 0,
      timeString,
      clearTimer,
    }),
    [timerEnd, secondsLeft, timeString, clearTimer],
  );

  return (
    <TimerCountdownContext.Provider value={value}>
      {children}
    </TimerCountdownContext.Provider>
  );
};

export const useTimerCountdown = (): TimerCountdown => {
  const ctx = useContext(TimerCountdownContext);
  if (!ctx)
    throw new Error(
      "useTimerCountdown must be used within a TimerCountdownProvider",
    );
  return ctx;
};
