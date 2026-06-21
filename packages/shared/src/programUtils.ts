import type { Program, Day, Exercise } from "./types";

/**
 * Returns true if two exercises refer to the same exercise slot
 * (same name, apparatus, and gym).
 */
export const isSameExercise = (a: Exercise, b: Exercise): boolean =>
  a.name === b.name && a.apparatus === b.apparatus && a.gym === b.gym;

/**
 * Returns all completed days in a program up to (but not including) the
 * current day, in chronological order (oldest first).
 */
export const getCompletedDaysInProgram = (program: Program): Day[] => {
  const days: Day[] = [];
  program.weeks.forEach((week, wIdx) => {
    if (wIdx > program.curWeekIdx) return;
    week.forEach((day, dIdx) => {
      if (wIdx === program.curWeekIdx && dIdx >= program.curDayIdx) return;
      days.push(day);
    });
  });
  return days;
};
