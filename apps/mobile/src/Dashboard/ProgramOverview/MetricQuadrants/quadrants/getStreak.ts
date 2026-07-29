import {
  Program,
  ProgramSummary,
  WorkoutDay,
  isFullySkipped,
  programWorkoutDays,
  startOfDay,
} from "@liftledger/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

interface StreakProgram {
  workoutDays: WorkoutDay[];
  restDays: number;
}

const programTime = (program: StreakProgram): number =>
  program.workoutDays.reduce((max, w) => Math.max(max, w.day), 0);

type DayInfo = { segment: string; restDays: number };

const completedDayMap = (programs: StreakProgram[]): Map<number, DayInfo> => {
  const ordered = [...programs].sort((a, b) => programTime(a) - programTime(b));

  const days = new Map<
    number,
    { order: number; rotationIdx: number; restDays: number }
  >();
  ordered.forEach((program, order) => {
    const restDays = program.restDays ?? 0;
    program.workoutDays.forEach(({ day, rotationIdx }) => {
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

export const getStreak = (programs: StreakProgram[]): number => {
  const days = completedDayMap(programs);
  if (days.size === 0) return 0;

  const sorted = [...days.keys()].sort((a, b) => b - a);
  const today = startOfDay(new Date());

  const recent = days.get(sorted[0])!;
  let restUsed = Math.max(0, (today - sorted[0]) / DAY_MS - 1);
  if (restUsed > recent.restDays) return 0;

  let streak = 1;
  let curSegment = recent.segment;
  for (let i = 1; i < sorted.length; i++) {
    const info = days.get(sorted[i])!;
    restUsed += (sorted[i - 1] - sorted[i]) / DAY_MS - 1;
    if (restUsed > info.restDays) break;

    if (info.segment !== curSegment) {
      curSegment = info.segment;
      restUsed = 0;
    }
    streak += 1;
  }

  return streak;
};

export const getMaxProgramStreak = (
  workoutDays: WorkoutDay[],
  restDays: number,
): number => {
  const days = new Map<number, number>();
  workoutDays.forEach(({ day, rotationIdx }) => {
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
    restUsed += (sorted[i] - sorted[i - 1]) / DAY_MS - 1;

    if (restUsed > restDays) {
      run = 1;
      restUsed = 0;
      prevSegment = segment;
      continue;
    }

    if (segment !== prevSegment) {
      prevSegment = segment;
      restUsed = 0;
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
  const idle = Math.max(0, (today - anchor) / DAY_MS - 1 - workedSinceAnchor);

  return Math.max(0, restDays - idle);
};
