import { Program } from "@liftledger/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const getStreak = (program: Program): number => {
  const completedDays = new Set<number>();
  program.weeks.forEach((week) =>
    week.forEach((day) => {
      if (day.completedDate)
        completedDays.add(startOfDay(new Date(day.completedDate)));
    }),
  );
  if (completedDays.size === 0) return 0;

  const today = startOfDay(new Date());
  let cursor: number;
  if (completedDays.has(today)) cursor = today;
  else if (completedDays.has(today - DAY_MS)) cursor = today - DAY_MS;
  else return 0;

  let streak = 0;
  while (completedDays.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
};
