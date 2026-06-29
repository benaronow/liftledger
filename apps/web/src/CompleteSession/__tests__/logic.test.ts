import { describe, it, expect } from "vitest";
import { Exercise } from "@liftledger/shared";

const makeExercise = (
  sets: Partial<{
    completed: boolean;
    skipped: boolean;
    reps: number;
    weight: number;
    note: string;
  }>[],
): Exercise => ({
  name: "Bench Press",
  apparatus: "Barbell",
  weightType: "lbs",
  sets: sets.map((s) => ({
    reps: s.reps ?? 0,
    weight: s.weight ?? 0,
    note: s.note ?? "",
    completed: s.completed ?? false,
    skipped: s.skipped ?? false,
  })),
});

// Inline mirrors of the computed values from CompleteSessionProvider
const isExerciseComplete = (exercise: Exercise) =>
  exercise.sets.length !== 0 &&
  exercise.sets.every((s) => s.completed || (s.skipped ?? false));

const isSessionStarted = (exercises: Exercise[]) =>
  exercises.some((ex) => ex.sets.some((s) => s.completed || s.skipped));

const isSessionComplete = (exercises: Exercise[]) =>
  exercises.every((ex) => isExerciseComplete(ex));

const getCurrentExIdx = (exercises: Exercise[]) =>
  exercises.findIndex((ex) => !isExerciseComplete(ex));

describe("isExerciseComplete", () => {
  it("returns false for exercise with no sets", () => {
    expect(isExerciseComplete(makeExercise([]))).toBe(false);
  });

  it("returns true when all sets are completed", () => {
    expect(
      isExerciseComplete(makeExercise([{ completed: true }, { completed: true }])),
    ).toBe(true);
  });

  it("returns true when all sets are skipped", () => {
    expect(
      isExerciseComplete(makeExercise([{ skipped: true }, { skipped: true }])),
    ).toBe(true);
  });

  it("returns true for a mix of completed and skipped sets", () => {
    expect(
      isExerciseComplete(makeExercise([{ completed: true }, { skipped: true }])),
    ).toBe(true);
  });

  it("returns false when any set is not done", () => {
    expect(
      isExerciseComplete(makeExercise([{ completed: true }, { completed: false }])),
    ).toBe(false);
  });

  it("returns false when no sets are started", () => {
    expect(
      isExerciseComplete(makeExercise([{ completed: false }, { completed: false }])),
    ).toBe(false);
  });
});

describe("isSessionStarted", () => {
  it("returns false when no sets are done", () => {
    expect(isSessionStarted([makeExercise([{ completed: false }])])).toBe(false);
  });

  it("returns true when one set is completed", () => {
    expect(isSessionStarted([makeExercise([{ completed: true }])])).toBe(true);
  });

  it("returns true when one set is skipped", () => {
    expect(isSessionStarted([makeExercise([{ skipped: true }])])).toBe(true);
  });

  it("returns false for empty exercises list", () => {
    expect(isSessionStarted([])).toBe(false);
  });
});

describe("isSessionComplete", () => {
  it("returns true for empty exercises list (vacuous truth)", () => {
    expect(isSessionComplete([])).toBe(true);
  });

  it("returns true when all exercises are complete", () => {
    expect(
      isSessionComplete([
        makeExercise([{ completed: true }]),
        makeExercise([{ skipped: true }]),
      ]),
    ).toBe(true);
  });

  it("returns false when one exercise is incomplete", () => {
    expect(
      isSessionComplete([
        makeExercise([{ completed: true }]),
        makeExercise([{ completed: false }]),
      ]),
    ).toBe(false);
  });

  it("returns false when an exercise has no sets", () => {
    expect(isSessionComplete([makeExercise([])])).toBe(false);
  });
});

describe("currentExIdx", () => {
  it("returns -1 when all exercises are complete", () => {
    expect(getCurrentExIdx([makeExercise([{ completed: true }])])).toBe(-1);
  });

  it("returns 0 when first exercise is incomplete", () => {
    expect(
      getCurrentExIdx([
        makeExercise([{ completed: false }]),
        makeExercise([{ completed: true }]),
      ]),
    ).toBe(0);
  });

  it("returns index of first incomplete exercise", () => {
    expect(
      getCurrentExIdx([
        makeExercise([{ completed: true }]),
        makeExercise([{ completed: false }]),
        makeExercise([{ completed: false }]),
      ]),
    ).toBe(1);
  });
});
