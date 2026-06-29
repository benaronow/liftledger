import { Program } from "@liftledger/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// The streak is the run of completed-session days ending at (or just before)
// today. `restDays` is a per-rotation budget: walking the run backwards, each
// missed day spends one day of the budget for the rotation it falls in, and the
// budget refreshes whenever we cross into an earlier rotation. Once a rotation's
// budget is exhausted, the next missed day breaks the streak. Rest days keep the
// streak alive but never add to its count — only completed days do.
export const getStreak = (program: Program): number => {
  const restDays = program.restDays ?? 0;

  // day -> rotation index. When a single day holds sessions from more than one
  // rotation, keep the most recent so the budget refresh lands at the boundary.
  const completedDays = new Map<number, number>();
  program.rotations.forEach((rotation, rotationIdx) =>
    rotation.forEach((session) => {
      if (!session.completedDate) return;
      const day = startOfDay(new Date(session.completedDate));
      completedDays.set(day, Math.max(completedDays.get(day) ?? 0, rotationIdx));
    }),
  );
  if (completedDays.size === 0) return 0;

  const mostRecent = Math.max(...completedDays.keys());
  const earliest = Math.min(...completedDays.keys());
  const today = startOfDay(new Date());

  // Today not being done yet is grace, not a missed day — start from yesterday.
  let cursor = completedDays.has(today) ? today : today - DAY_MS;

  let streak = 0;
  let curRotation = completedDays.get(mostRecent)!;
  let restUsed = 0;

  // Below the earliest completed day there's nothing left to count and the budget
  // can't refresh, so the streak is settled.
  while (cursor >= earliest) {
    const rotation = completedDays.get(cursor);
    if (rotation !== undefined) {
      if (rotation !== curRotation) {
        curRotation = rotation;
        restUsed = 0;
      }
      streak += 1;
    } else {
      restUsed += 1;
      if (restUsed > restDays) break;
    }
    cursor -= DAY_MS;
  }

  return streak;
};
