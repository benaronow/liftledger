import { Program, Session } from "@liftledger/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const isFullySkipped = (session: Session): boolean =>
  session.exercises.every((exercise) =>
    exercise.sets.every((set) => !set.completed),
  );

const completedDayMap = (program: Program): Map<number, number> => {
  const days = new Map<number, number>();
  program.rotations.forEach((rotation, rotationIdx) =>
    rotation.forEach((session) => {
      if (!session.completedDate || isFullySkipped(session)) return;
      const day = startOfDay(new Date(session.completedDate));
      days.set(day, Math.max(days.get(day) ?? 0, rotationIdx));
    }),
  );
  return days;
};

export const getStreak = (program: Program): number => {
  const restDays = program.restDays ?? 0;
  const days = completedDayMap(program);
  if (days.size === 0) return 0;

  const sorted = [...days.keys()].sort((a, b) => b - a);
  const today = startOfDay(new Date());

  let restUsed = Math.max(0, (today - sorted[0]) / DAY_MS - 1);
  if (restUsed > restDays) return 0;

  let streak = 1;
  let curRotation = days.get(sorted[0])!;
  for (let i = 1; i < sorted.length; i++) {
    restUsed += (sorted[i - 1] - sorted[i]) / DAY_MS - 1;
    if (restUsed > restDays) break;
    if (days.get(sorted[i]) !== curRotation) {
      curRotation = days.get(sorted[i])!;
      restUsed = 0;
    }
    streak += 1;
  }

  return streak;
};

export const getRestDaysRemaining = (program: Program): number => {
  const restDays = program.restDays ?? 0;
  const rotation = program.rotations[program.curRotationIdx];
  if (!rotation) return restDays;

  const completedDays = rotation
    .filter((session) => session.completedDate)
    .map((session) => startOfDay(new Date(session.completedDate!)));
  if (completedDays.length === 0) return restDays;

  const start = Math.min(...completedDays);
  const today = startOfDay(new Date());
  const daysThroughYesterday = Math.max(0, (today - start) / DAY_MS);
  const completedBeforeToday = new Set(
    completedDays.filter((day) => day < today),
  ).size;
  const idle = daysThroughYesterday - completedBeforeToday;

  return Math.max(0, restDays - idle);
};
