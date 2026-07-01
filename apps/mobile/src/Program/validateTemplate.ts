import { Program } from "@liftledger/shared";

export interface ProgramErrors {
  name?: string;
  length?: string;
  primaryGym?: string;
}

// Per-field messages for a single exercise; a missing key means that field is
// valid. Keyed by field so each control can show its own error inline.
export interface ExerciseErrors {
  name?: string;
  equipment?: string;
  weightType?: string;
  sets?: string;
}

export interface SessionErrors {
  name?: string;
  // Parallel to the session's VISIBLE (!addedOn) exercises, by eIdx.
  exercises: ExerciseErrors[];
}

export interface TemplateErrors {
  program: ProgramErrors;
  sessions: SessionErrors[]; // parallel to rotations[editingRotationIdx], by session index
}

export const validateTemplate = (
  program: Program,
  editingRotationIdx: number,
): TemplateErrors => {
  const programErrors: ProgramErrors = {};
  if (!program.name) programErrors.name = "Enter a program name";
  if (program.length === 0) programErrors.length = "Must be at least 1 rotation";
  if (!program.primaryGym) programErrors.primaryGym = "Select a primary gym";

  const sessions: SessionErrors[] = program.rotations[editingRotationIdx].map((session) => ({
    name: !session.name ? "Enter a session name" : undefined,
    exercises: session.exercises
      .filter((e) => !e.addedOn)
      .map((exercise) => {
        const errors: ExerciseErrors = {};
        if (!exercise.name) errors.name = "Select an exercise";
        if (!exercise.equipment) errors.equipment = "Select an equipment";
        if (!exercise.weightType) errors.weightType = "Select a weight type";
        if (exercise.sets.length === 0) errors.sets = "Add at least one set";
        return errors;
      }),
  }));

  return { program: programErrors, sessions };
};

export const hasAnyError = (errors: TemplateErrors): boolean =>
  Object.keys(errors.program).length > 0 ||
  errors.sessions.some(
    (d) =>
      d.name !== undefined ||
      d.exercises.some((ex) => Object.keys(ex).length > 0),
  );
