import { describe, it, expect } from "vitest";
import { validateTemplate } from "@/EditProgram/validateTemplate";
import { Program, Session, Exercise } from "@liftledger/shared";

const makeSet = () => ({ reps: 10, weight: 100, note: "", completed: false });

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  name: "Bench Press",
  apparatus: "Barbell",
  weightType: "lbs",
  sets: [makeSet()],
  ...overrides,
});

const makeSession = (
  name: string,
  exercises: Exercise[] = [makeExercise()],
): Session => ({
  name,
  exercises,
  completedDate: undefined,
});

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  name: "My Program",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  rotations: [[makeSession("Session 1")]],
  curRotationIdx: 0,
  curSessionIdx: 0,
  ...overrides,
});

describe("getTemplateErrors", () => {
  it("returns no errors for a valid program", () => {
    expect(validateTemplate(makeProgram(), 0)).toEqual([]);
  });

  it("adds 'Program name missing' when name is empty", () => {
    expect(validateTemplate(makeProgram({ name: "" }), 0)).toContain(
      "Program name missing",
    );
  });

  it("adds 'Program length too short' when length is 0", () => {
    expect(validateTemplate(makeProgram({ length: 0 }), 0)).toContain(
      "Program length too short",
    );
  });

  it("adds 'Primary gym missing' when primaryGym is empty", () => {
    expect(validateTemplate(makeProgram({ primaryGym: "" }), 0)).toContain(
      "Primary gym missing",
    );
  });

  it("adds session name when exercise has no name", () => {
    const program = makeProgram({
      rotations: [[makeSession("Leg Session", [makeExercise({ name: "" })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Session");
  });

  it("adds session name when exercise has no apparatus", () => {
    const program = makeProgram({
      rotations: [[makeSession("Leg Session", [makeExercise({ apparatus: "" })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Session");
  });

  it("adds session name when exercise has no weightType", () => {
    const program = makeProgram({
      rotations: [[makeSession("Leg Session", [makeExercise({ weightType: "" })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Session");
  });

  it("adds session name when exercise has no sets", () => {
    const program = makeProgram({
      rotations: [[makeSession("Leg Session", [makeExercise({ sets: [] })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Session");
  });

  it("accumulates multiple top-level errors", () => {
    const errors = validateTemplate(makeProgram({ name: "", length: 0 }), 0);
    expect(errors).toContain("Program name missing");
    expect(errors).toContain("Program length too short");
  });

  it("adds session name once per invalid exercise, not per missing field", () => {
    const program = makeProgram({
      rotations: [[makeSession("Session 1", [makeExercise({ name: "", apparatus: "" })])]],
    });
    const errors = validateTemplate(program, 0);
    expect(errors.filter((e) => e === "Session 1").length).toBe(1);
  });

  it("checks exercises in the specified editingRotationIdx", () => {
    const program = makeProgram({
      rotations: [
        [makeSession("Week1Day1")],
        [makeSession("Week2Day1", [makeExercise({ name: "" })])],
      ],
    });
    expect(validateTemplate(program, 0)).not.toContain("Week2Day1");
    expect(validateTemplate(program, 1)).toContain("Week2Day1");
  });
});
