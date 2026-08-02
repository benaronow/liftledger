import type { Program, ProgramSummary, Session } from "./types";

export const startOfDay = (date: Date | string | number): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const isFullySkipped = (session: Session): boolean =>
  session.exercises.every((exercise) =>
    exercise.workingSets.every((set) => !set.completed),
  );

export interface WorkoutDay {
  // Raw completion time in epoch ms. Callers collapse this to a calendar day
  // with startOfDay so the grouping happens in the viewer's timezone, not the
  // timezone of whichever machine built the summary.
  time: number;
  rotationIdx: number;
}

export const programWorkoutDays = (program: Program): WorkoutDay[] => {
  const days: WorkoutDay[] = [];
  program.rotations.forEach((rotation, rotationIdx) =>
    rotation.forEach((session) => {
      if (!session.completedDate || isFullySkipped(session)) return;
      days.push({
        time: new Date(session.completedDate).getTime(),
        rotationIdx,
      });
    }),
  );
  return days;
};

const completedDates = (program: Program): number[] =>
  program.rotations
    .flat()
    .map((session) => session.completedDate)
    .filter((date): date is Date => !!date)
    .map((date) => new Date(date).getTime());

export const programStartDate = (program: Program): Date | undefined => {
  const times = completedDates(program);
  return times.length ? new Date(Math.min(...times)) : undefined;
};

export const programEndDate = (program: Program): Date | undefined => {
  const times = completedDates(program);
  return times.length ? new Date(Math.max(...times)) : undefined;
};

export const completedSessionCount = (program: Program): number =>
  program.rotations.flat().filter((session) => !!session.completedDate).length;

export const programVolume = (program: Program): number => {
  let total = 0;
  const addSet = (set: {
    weight: number | null;
    reps: number | null;
    completed: boolean;
    dropSets?: {
      weight: number | null;
      reps: number | null;
      completed: boolean;
    }[];
  }) => {
    if (set.completed) total += (set.weight ?? 0) * (set.reps ?? 0);
    set.dropSets?.forEach((drop) => {
      if (drop.completed) total += (drop.weight ?? 0) * (drop.reps ?? 0);
    });
  };

  program.rotations.forEach((rotation) =>
    rotation.forEach((session) =>
      session.exercises.forEach((exercise) =>
        exercise.workingSets.forEach(addSet),
      ),
    ),
  );
  return total;
};

// Most-frequent unit across completed working sets, used to label total volume.
export const dominantUnit = (program: Program): string => {
  const counts = new Map<string, number>();
  program.rotations.forEach((rotation) =>
    rotation.forEach((session) =>
      session.exercises.forEach((exercise) => {
        if (exercise.workingSets.some((set) => set.completed)) {
          counts.set(exercise.unit, (counts.get(exercise.unit) ?? 0) + 1);
        }
      }),
    ),
  );
  let best = "";
  let bestCount = 0;
  counts.forEach((count, unit) => {
    if (count > bestCount) {
      best = unit;
      bestCount = count;
    }
  });
  return best;
};

export const toProgramSummary = (program: Program): ProgramSummary => ({
  _id: String(program._id),
  name: program.name,
  startDate: programStartDate(program),
  endDate: programEndDate(program),
  rotationCount: program.rotations.length,
  sessionCount: completedSessionCount(program),
  restDays: program.restDays ?? 0,
  curRotationIdx: program.curRotationIdx,
  volume: programVolume(program),
  unit: dominantUnit(program),
  workoutDays: programWorkoutDays(program),
});
