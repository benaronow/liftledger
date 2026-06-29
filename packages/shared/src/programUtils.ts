import type { Program, Session, Exercise } from "./types";

/**
 * Returns true if two exercises refer to the same exercise slot
 * (same name, apparatus, and gym).
 */
export const isSameExercise = (a: Exercise, b: Exercise): boolean =>
  a.name === b.name && a.apparatus === b.apparatus && a.gym === b.gym;

/**
 * Returns all completed sessions in a program up to (but not including) the
 * current session, in chronological order (oldest first).
 */
export const getCompletedSessionsInProgram = (program: Program): Session[] => {
  const sessions: Session[] = [];
  program.rotations.forEach((rotation, wIdx) => {
    if (wIdx > program.curRotationIdx) return;
    rotation.forEach((session, dIdx) => {
      if (wIdx === program.curRotationIdx && dIdx >= program.curSessionIdx) return;
      sessions.push(session);
    });
  });
  return sessions;
};
