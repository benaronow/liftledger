import { Program } from "@liftledger/shared";

export interface ProgramErrors {
  name?: string;
  length?: string;
  primaryGym?: string;
}

export interface ExerciseErrors {
  name?: string;
  equipment?: string;
  unit?: string;
  workingSets?: string;
}

export interface SessionErrors {
  name?: string;
  exercises: ExerciseErrors[];
}

export interface TemplateErrors {
  program: ProgramErrors;
  sessions: SessionErrors[];
}

export const validateTemplate = (
  program: Program,
  editingRotationIdx: number,
): TemplateErrors => {
  const programErrors: ProgramErrors = {};
  if (!program.name) programErrors.name = "Enter a program name";
  if (program.length === 0)
    programErrors.length = "Must be at least 1 rotation";
  if (!program.primaryGym) programErrors.primaryGym = "Select a primary gym";

  const sessions: SessionErrors[] = program.rotations[editingRotationIdx].map(
    (session) => ({
      name: !session.name ? "Enter a session name" : undefined,
      exercises: session.exercises
        .filter((e) => !e.addedOn)
        .map((exercise) => {
          const errors: ExerciseErrors = {};
          if (!exercise.name) errors.name = "Select an exercise";
          if (!exercise.equipment) errors.equipment = "Select equipment";
          if (!exercise.unit) errors.unit = "Select a unit";
          if (exercise.workingSets.length === 0)
            errors.workingSets = "Add at least one set";
          return errors;
        }),
    }),
  );

  return { program: programErrors, sessions };
};

export const hasAnyError = (errors: TemplateErrors): boolean =>
  Object.keys(errors.program).length > 0 ||
  errors.sessions.some(
    (d) =>
      d.name !== undefined ||
      d.exercises.some((ex) => Object.keys(ex).length > 0),
  );
