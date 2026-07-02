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

  // Writes go through the full-user PUT (useUpdateUser), which propagates to the
  // `me` cache. Spread the existing settings — including `end`, which is managed
  // by the separate optimistic timerEnd endpoints — so a settings save never
  // drops sibling fields.
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

  // Passing `undefined` removes the exercise's override entirely.
  const setExerciseOverride = useCallback(
    (name: string, seconds: number | undefined) => {
      const next = { ...exerciseOverrides };
      if (seconds === undefined) delete next[name];
      else next[name] = seconds;
      return saveSettings({ exerciseOverrides: next });
    },
    [exerciseOverrides, saveSettings],
  );

  // Duration to auto-start after a completed set. `defaultEnabled` is the master
  // switch: when off, nothing auto-starts (overrides included, matching the
  // disabled overrides UI). When on, a per-exercise override wins over the
  // default. `undefined` means "don't start a timer".
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
