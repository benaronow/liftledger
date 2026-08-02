import {
  Program,
  ProgramSummary,
  WorkoutDay,
  isFullySkipped,
  programWorkoutDays,
  startOfDay,
} from "@liftledger/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

// Local midnights are not always exactly 24h apart (DST), so round the
// quotient to whole days instead of trusting it to be integral.
const daysBetween = (later: number, earlier: number): number =>
  Math.round((later - earlier) / DAY_MS);

interface StreakProgram {
  workoutDays: WorkoutDay[];
  restDays: number;
}

const programTime = (program: StreakProgram): number =>
  program.workoutDays.reduce((max, w) => Math.max(max, w.time), 0);

type DayInfo = { segment: string; restDays: number };

const completedDayMap = (programs: StreakProgram[]): Map<number, DayInfo> => {
  const ordered = [...programs].sort((a, b) => programTime(a) - programTime(b));

  const days = new Map<
    number,
    { order: number; rotationIdx: number; restDays: number }
  >();
  ordered.forEach((program, order) => {
    const restDays = program.restDays ?? 0;
    program.workoutDays.forEach(({ time, rotationIdx }) => {
      const day = startOfDay(time);
      const prev = days.get(day);

      if (
        !prev ||
        order > prev.order ||
        (order === prev.order && rotationIdx > prev.rotationIdx)
      ) {
        days.set(day, { order, rotationIdx, restDays });
      }
    });
  });

  const result = new Map<number, DayInfo>();
  days.forEach(({ order, rotationIdx, restDays }, day) =>
    result.set(day, { segment: `${order}:${rotationIdx}`, restDays }),
  );
  return result;
};

export const withCurrentProgram = (
  summaries: ProgramSummary[] | undefined,
  current: Program,
): StreakProgram[] => [
  ...(summaries ?? [])
    .filter((s) => s._id !== current._id)
    .map((s) => ({ workoutDays: s.workoutDays, restDays: s.restDays })),
  { workoutDays: programWorkoutDays(current), restDays: current.restDays ?? 0 },
];

// Walks workout days chronologically, charging the rest days inside each gap
// against the allowance of the segment (program rotation) being entered.
// Exceeding the allowance kills the streak at that gap: the count restarts
// from the next workout with a fresh allowance. The still-open gap between the
// last workout and today can only kill the streak, never shrink it — the
// displayed value must hold steady through allowed rest days and drop straight
// to zero once the allowance is truly spent.
export const getStreak = (programs: StreakProgram[]): number => {
  const days = completedDayMap(programs);
  if (days.size === 0) return 0;

  const sorted = [...days.keys()].sort((a, b) => a - b);
  const today = startOfDay(new Date());

  let streak = 1;
  let restUsed = 0;
  let curSegment = days.get(sorted[0])!.segment;
  for (let i = 1; i < sorted.length; i++) {
    const info = days.get(sorted[i])!;
    if (info.segment !== curSegment) {
      curSegment = info.segment;
      restUsed = 0;
    }
    restUsed += daysBetween(sorted[i], sorted[i - 1]) - 1;
    if (restUsed > info.restDays) {
      streak = 1;
      restUsed = 0;
    } else {
      streak += 1;
    }
  }

  const last = sorted[sorted.length - 1];
  restUsed += Math.max(0, daysBetween(today, last) - 1);
  return restUsed > days.get(last)!.restDays ? 0 : streak;
};

export const getMaxProgramStreak = (
  workoutDays: WorkoutDay[],
  restDays: number,
): number => {
  const days = new Map<number, number>();
  workoutDays.forEach(({ time, rotationIdx }) => {
    const day = startOfDay(time);
    days.set(day, Math.max(days.get(day) ?? rotationIdx, rotationIdx));
  });
  if (days.size === 0) return 0;

  const sorted = [...days.keys()].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  let restUsed = 0;
  let prevSegment = days.get(sorted[0])!;

  for (let i = 1; i < sorted.length; i++) {
    const segment = days.get(sorted[i])!;
    if (segment !== prevSegment) {
      prevSegment = segment;
      restUsed = 0;
    }
    restUsed += daysBetween(sorted[i], sorted[i - 1]) - 1;

    if (restUsed > restDays) {
      run = 1;
      restUsed = 0;
      continue;
    }
    run += 1;
    best = Math.max(best, run);
  }

  return best;
};

export const getRestDaysRemaining = (program: Program): number => {
  const restDays = program.restDays ?? 0;

  const days = new Map<number, number>();
  program.rotations.forEach((rotation, rotationIdx) =>
    rotation.forEach((session) => {
      if (!session.completedDate || isFullySkipped(session)) return;
      const day = startOfDay(new Date(session.completedDate));
      days.set(day, Math.max(days.get(day) ?? 0, rotationIdx));
    }),
  );
  if (days.size === 0) return restDays;

  const today = startOfDay(new Date());

  const prevRotationDays: number[] = [];
  const curRotationDays: number[] = [];
  days.forEach((rotationIdx, day) => {
    if (rotationIdx < program.curRotationIdx) prevRotationDays.push(day);
    else if (rotationIdx === program.curRotationIdx) curRotationDays.push(day);
  });

  const anchor = prevRotationDays.length
    ? Math.max(...prevRotationDays)
    : curRotationDays.length
      ? Math.min(...curRotationDays)
      : today;

  const workedSinceAnchor = [...days.keys()].filter(
    (day) => day > anchor && day < today,
  ).length;
  const idle = Math.max(0, daysBetween(today, anchor) - 1 - workedSinceAnchor);

  return Math.max(0, restDays - idle);
};
