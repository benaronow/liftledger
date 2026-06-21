import { describe, it, expect } from "vitest";
import { validateTemplate } from "@/EditProgram/validateTemplate";
import { Program, Day, Exercise } from "@liftledger/shared";

const makeSet = () => ({ reps: 10, weight: 100, note: "", completed: false });

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  name: "Bench Press",
  apparatus: "Barbell",
  weightType: "lbs",
  sets: [makeSet()],
  ...overrides,
});

const makeDay = (
  name: string,
  exercises: Exercise[] = [makeExercise()],
): Day => ({
  name,
  exercises,
  completedDate: undefined,
});

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  name: "My Program",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  weeks: [[makeDay("Day 1")]],
  curWeekIdx: 0,
  curDayIdx: 0,
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

  it("adds day name when exercise has no name", () => {
    const program = makeProgram({
      weeks: [[makeDay("Leg Day", [makeExercise({ name: "" })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Day");
  });

  it("adds day name when exercise has no apparatus", () => {
    const program = makeProgram({
      weeks: [[makeDay("Leg Day", [makeExercise({ apparatus: "" })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Day");
  });

  it("adds day name when exercise has no weightType", () => {
    const program = makeProgram({
      weeks: [[makeDay("Leg Day", [makeExercise({ weightType: "" })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Day");
  });

  it("adds day name when exercise has no sets", () => {
    const program = makeProgram({
      weeks: [[makeDay("Leg Day", [makeExercise({ sets: [] })])]],
    });
    expect(validateTemplate(program, 0)).toContain("Leg Day");
  });

  it("accumulates multiple top-level errors", () => {
    const errors = validateTemplate(makeProgram({ name: "", length: 0 }), 0);
    expect(errors).toContain("Program name missing");
    expect(errors).toContain("Program length too short");
  });

  it("adds day name once per invalid exercise, not per missing field", () => {
    const program = makeProgram({
      weeks: [[makeDay("Day 1", [makeExercise({ name: "", apparatus: "" })])]],
    });
    const errors = validateTemplate(program, 0);
    expect(errors.filter((e) => e === "Day 1").length).toBe(1);
  });

  it("checks exercises in the specified editingWeekIdx", () => {
    const program = makeProgram({
      weeks: [
        [makeDay("Week1Day1")],
        [makeDay("Week2Day1", [makeExercise({ name: "" })])],
      ],
    });
    expect(validateTemplate(program, 0)).not.toContain("Week2Day1");
    expect(validateTemplate(program, 1)).toContain("Week2Day1");
  });
});
