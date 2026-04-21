import { describe, it, expect } from "vitest";
import { validateTemplate } from "@/app/edit-block/validateTemplate";
import { Block, Day, Exercise } from "@/lib/types";

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

const makeBlock = (overrides: Partial<Block> = {}): Block => ({
  name: "My Block",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  weeks: [[makeDay("Day 1")]],
  curWeekIdx: 0,
  curDayIdx: 0,
  ...overrides,
});

describe("getTemplateErrors", () => {
  it("returns no errors for a valid block", () => {
    expect(validateTemplate(makeBlock(), 0)).toEqual([]);
  });

  it("adds 'Block name missing' when name is empty", () => {
    expect(validateTemplate(makeBlock({ name: "" }), 0)).toContain(
      "Block name missing",
    );
  });

  it("adds 'Block length too short' when length is 0", () => {
    expect(validateTemplate(makeBlock({ length: 0 }), 0)).toContain(
      "Block length too short",
    );
  });

  it("adds 'Primary gym missing' when primaryGym is empty", () => {
    expect(validateTemplate(makeBlock({ primaryGym: "" }), 0)).toContain(
      "Primary gym missing",
    );
  });

  it("adds day name when exercise has no name", () => {
    const block = makeBlock({
      weeks: [[makeDay("Leg Day", [makeExercise({ name: "" })])]],
    });
    expect(validateTemplate(block, 0)).toContain("Leg Day");
  });

  it("adds day name when exercise has no apparatus", () => {
    const block = makeBlock({
      weeks: [[makeDay("Leg Day", [makeExercise({ apparatus: "" })])]],
    });
    expect(validateTemplate(block, 0)).toContain("Leg Day");
  });

  it("adds day name when exercise has no weightType", () => {
    const block = makeBlock({
      weeks: [[makeDay("Leg Day", [makeExercise({ weightType: "" })])]],
    });
    expect(validateTemplate(block, 0)).toContain("Leg Day");
  });

  it("adds day name when exercise has no sets", () => {
    const block = makeBlock({
      weeks: [[makeDay("Leg Day", [makeExercise({ sets: [] })])]],
    });
    expect(validateTemplate(block, 0)).toContain("Leg Day");
  });

  it("accumulates multiple top-level errors", () => {
    const errors = validateTemplate(makeBlock({ name: "", length: 0 }), 0);
    expect(errors).toContain("Block name missing");
    expect(errors).toContain("Block length too short");
  });

  it("adds day name once per invalid exercise, not per missing field", () => {
    const block = makeBlock({
      weeks: [[makeDay("Day 1", [makeExercise({ name: "", apparatus: "" })])]],
    });
    const errors = validateTemplate(block, 0);
    expect(errors.filter((e) => e === "Day 1").length).toBe(1);
  });

  it("checks exercises in the specified editingWeekIdx", () => {
    const block = makeBlock({
      weeks: [
        [makeDay("Week1Day1")],
        [makeDay("Week2Day1", [makeExercise({ name: "" })])],
      ],
    });
    expect(validateTemplate(block, 0)).not.toContain("Week2Day1");
    expect(validateTemplate(block, 1)).toContain("Week2Day1");
  });
});
