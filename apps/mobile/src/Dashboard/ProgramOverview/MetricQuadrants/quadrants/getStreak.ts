import { Program, Session } from "@liftledger/shared";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const isFullySkipped = (session: Session): boolean =>
  session.exercises.every((exercise) =>
    exercise.workingSets.every((set) => !set.completed),
  );

const blockTime = (program: Program): number => {
  let latest = 0;
  program.rotations.forEach((rotation) =>
    rotation.forEach((session) => {
      if (session.completedDate) {
        latest = Math.max(latest, startOfDay(new Date(session.completedDate)));
      }
    }),
  );
  if (latest) return latest;
  return program.endDate ? startOfDay(new Date(program.endDate)) : 0;
};

type DayInfo = { segment: string; restDays: number };

const completedDayMap = (programs: Program[]): Map<number, DayInfo> => {
  const ordered = [...programs].sort((a, b) => blockTime(a) - blockTime(b));

  const days = new Map<
    number,
    { order: number; rotationIdx: number; restDays: number }
  >();
  ordered.forEach((program, order) => {
    const restDays = program.restDays ?? 0;
    program.rotations.forEach((rotation, rotationIdx) =>
      rotation.forEach((session) => {
        if (!session.completedDate || isFullySkipped(session)) return;

        const day = startOfDay(new Date(session.completedDate));
        const prev = days.get(day);

        if (
          !prev ||
          order > prev.order ||
          (order === prev.order && rotationIdx > prev.rotationIdx)
        ) {
          days.set(day, { order, rotationIdx, restDays });
        }
      }),
    );
  });

  const result = new Map<number, DayInfo>();
  days.forEach(({ order, rotationIdx, restDays }, day) =>
    result.set(day, { segment: `${order}:${rotationIdx}`, restDays }),
  );
  return result;
};

export const withCurrentBlock = (
  blocks: Program[] | undefined,
  current: Program,
): Program[] => [
  ...(blocks ?? []).filter((p) => p._id !== current._id),
  current,
];

export const getStreak = (programs: Program[]): number => {
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
