import type { Block, Day, Exercise } from "./types";

/**
 * Returns true if two exercises refer to the same exercise slot
 * (same name, apparatus, and gym).
 */
export const isSameExercise = (a: Exercise, b: Exercise): boolean =>
  a.name === b.name && a.apparatus === b.apparatus && a.gym === b.gym;

/**
 * Returns all completed days in a block up to (but not including) the
 * current day, in chronological order (oldest first).
 */
export const getCompletedDaysInBlock = (block: Block): Day[] => {
  const days: Day[] = [];
  block.weeks.forEach((week, wIdx) => {
    if (wIdx > block.curWeekIdx) return;
    week.forEach((day, dIdx) => {
      if (wIdx === block.curWeekIdx && dIdx >= block.curDayIdx) return;
      days.push(day);
    });
  });
  return days;
};
