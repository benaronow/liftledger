import { useCallback, useMemo } from "react";
import type { TimerPresets, TimerSettings } from "@liftledger/shared";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

export const useTimerSettings = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const settings = curUser?.timerSettings;
  const presets = settings?.presets;
  const defaultEnabled = settings?.defaultEnabled ?? true;
  const defaultTime = settings?.defaultTime ?? 120;
  const exerciseOverrides = useMemo(
    () => settings?.exerciseOverrides ?? {},
    [settings?.exerciseOverrides],
  );

  const saveSettings = useCallback(
    (patch: Partial<TimerSettings>) => {
      if (!curUser || !settings) return Promise.resolve(undefined);
      return triggerUpdateUser({
        ...curUser,
        timerSettings: { ...settings, ...patch },
      });
    },
    [curUser, settings, triggerUpdateUser],
  );

  const savePresets = useCallback(
    (next: TimerPresets) => saveSettings({ presets: next }),
    [saveSettings],
  );

  const setDefaultEnabled = useCallback(
    (enabled: boolean) => saveSettings({ defaultEnabled: enabled }),
    [saveSettings],
  );

  const setDefaultTime = useCallback(
    (seconds: number) => saveSettings({ defaultTime: seconds }),
    [saveSettings],
  );

  const setExerciseOverride = useCallback(
    (name: string, seconds: number | undefined) => {
      const next = { ...exerciseOverrides };
      if (seconds === undefined) delete next[name];
      else next[name] = seconds;
      return saveSettings({ exerciseOverrides: next });
    },
    [exerciseOverrides, saveSettings],
  );

  const resolveDuration = useCallback(
    (exerciseName: string): number | undefined => {
      if (!defaultEnabled) return undefined;
      return exerciseOverrides[exerciseName] ?? defaultTime;
    },
    [exerciseOverrides, defaultEnabled, defaultTime],
  );

  return {
    presets,
    savePresets,
    defaultEnabled,
    setDefaultEnabled,
    defaultTime,
    setDefaultTime,
    exerciseOverrides,
    setExerciseOverride,
    resolveDuration,
  };
};
