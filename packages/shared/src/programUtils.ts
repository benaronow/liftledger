import type { Program, Session, Exercise } from "./types";

export const buildProgramWithSessionExercises = (
  program: Program,
  updatedExercises: Exercise[],
): Program => {
  const newSessions: Session[] = program.rotations[
    program.curRotationIdx
  ].toSpliced(program.curSessionIdx, 1, {
    ...program.rotations[program.curRotationIdx][program.curSessionIdx],
    exercises: updatedExercises,
  });

  const updatedLaterDays: Session[] = newSessions.map((session, idx) =>
    idx <= program.curSessionIdx
      ? session
      : {
          ...session,
          exercises: session.exercises.map((exercise) => {
            const completedExercise = updatedExercises.find((e) =>
              isSameExercise(e, exercise),
            );

            return completedExercise
              ? {
                  ...completedExercise,
                  warmupSets: (completedExercise.warmupSets ?? [])
                    .filter((set) => !set.addedOn)
                    .map((set) => ({
                      ...set,
                      completed: false,
                      skipped: undefined,
                      note: "",
                    })),
                  workingSets: completedExercise.workingSets
                    .filter((set) => !set.addedOn)
                    .map((set) => ({
                      ...set,
                      completed: false,
                      skipped: undefined,
                      note: "",
                      dropSets: undefined,
                    })),
                }
              : exercise;
          }),
        },
  );

  return {
    ...program,
    rotations: program.rotations.toSpliced(
      program.curRotationIdx,
      1,
      updatedLaterDays,
    ),
  };
};

export const isSameExercise = (a: Exercise, b: Exercise): boolean =>
  a.name === b.name && a.equipment === b.equipment && a.gym === b.gym;

export const getCompletedSessionsInProgram = (program: Program): Session[] => {
  const sessions: Session[] = [];
  program.rotations.forEach((rotation, wIdx) => {
    if (wIdx > program.curRotationIdx) return;
    rotation.forEach((session, dIdx) => {
      if (wIdx === program.curRotationIdx && dIdx >= program.curSessionIdx)
        return;
      sessions.push(session);
    });
  });
  return sessions;
};
