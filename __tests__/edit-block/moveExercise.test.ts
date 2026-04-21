import { describe, it, expect } from "vitest";
import { moveExercise } from "@/app/edit-block/EditDay/moveExercise";
import { Exercise } from "@/lib/types";

const makeExercise = (name: string, addedOn?: boolean): Exercise => ({
  name,
  apparatus: "Barbell",
  weightType: "lbs",
  sets: [{ reps: 10, weight: 100, note: "", completed: false }],
  addedOn,
});

const names = (exercises: Exercise[]) => exercises.map((e) => e.name);

describe("moveExerciseInDay — no addons", () => {
  it("moves first exercise down", () => {
    const result = moveExercise(
      [makeExercise("A"), makeExercise("B"), makeExercise("C")],
      0,
      "down",
    );
    expect(names(result)).toEqual(["B", "A", "C"]);
  });

  it("moves last exercise up", () => {
    const result = moveExercise(
      [makeExercise("A"), makeExercise("B"), makeExercise("C")],
      2,
      "up",
    );
    expect(names(result)).toEqual(["A", "C", "B"]);
  });

  it("moves middle exercise up", () => {
    const result = moveExercise(
      [makeExercise("A"), makeExercise("B"), makeExercise("C")],
      1,
      "up",
    );
    expect(names(result)).toEqual(["B", "A", "C"]);
  });

  it("moves middle exercise down", () => {
    const result = moveExercise(
      [makeExercise("A"), makeExercise("B"), makeExercise("C")],
      1,
      "down",
    );
    expect(names(result)).toEqual(["A", "C", "B"]);
  });

  it("preserves total exercise count", () => {
    const exercises = [makeExercise("A"), makeExercise("B"), makeExercise("C")];
    const result = moveExercise(exercises, 1, "up");
    expect(result.length).toBe(exercises.length);
  });
});

describe("moveExerciseInDay — with addons", () => {
  it("moves exercise down with its trailing addons", () => {
    const result = moveExercise(
      [makeExercise("A"), makeExercise("A-addon", true), makeExercise("B")],
      0,
      "down",
    );
    expect(names(result)).toEqual(["B", "A", "A-addon"]);
  });

  it("moves exercise up over a group that has addons", () => {
    const result = moveExercise(
      [makeExercise("A"), makeExercise("A-addon", true), makeExercise("B")],
      1,
      "up",
    );
    expect(names(result)).toEqual(["B", "A", "A-addon"]);
  });

  it("keeps the target group intact when moving past it", () => {
    const result = moveExercise(
      [
        makeExercise("A"),
        makeExercise("B"),
        makeExercise("B-addon", true),
        makeExercise("C"),
      ],
      0,
      "down",
    );
    expect(names(result)).toEqual(["B", "B-addon", "A", "C"]);
  });

  it("moves exercise with multiple trailing addons", () => {
    const result = moveExercise(
      [
        makeExercise("A"),
        makeExercise("A-addon1", true),
        makeExercise("A-addon2", true),
        makeExercise("B"),
      ],
      0,
      "down",
    );
    expect(names(result)).toEqual(["B", "A", "A-addon1", "A-addon2"]);
  });

  it("preserves all addon exercises after move", () => {
    const exercises = [
      makeExercise("A"),
      makeExercise("A-addon", true),
      makeExercise("B"),
    ];
    const result = moveExercise(exercises, 0, "down");
    expect(result.filter((e) => e.addedOn).length).toBe(1);
  });
});
