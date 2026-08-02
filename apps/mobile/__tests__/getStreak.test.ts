import { afterEach, describe, expect, it, vi } from "vitest";
import type { Program, ProgramSummary, WorkoutDay } from "@liftledger/shared";
import {
  getMaxProgramStreak,
  getRestDaysRemaining,
  getStreak,
  withCurrentProgram,
} from "../src/Dashboard/ProgramOverview/MetricQuadrants/quadrants/getStreak";

// Noon on a local calendar day (tests run pinned to America/Chicago).
const at = (y: number, mo: number, d: number, h = 12, min = 0) =>
  new Date(y, mo - 1, d, h, min).getTime();

const wd = (time: number, rotationIdx = 0) => ({ time, rotationIdx });

const session = (completedDate: number | undefined, completed = true) => ({
  name: "Session",
  exercises: [
    {
      name: "Bench Press",
      equipment: "Barbell",
      unit: "lbs",
      workingSets: [{ reps: 5, weight: 100, note: "", completed }],
    },
  ],
  completedDate:
    completedDate === undefined ? undefined : new Date(completedDate),
});

const makeProgram = (
  rotations: ReturnType<typeof session>[][],
  overrides: Partial<Program> = {},
): Program => ({
  name: "Test Program",
  length: rotations.length,
  rotations,
  curRotationIdx: 0,
  curSessionIdx: 0,
  restDays: 0,
  ...overrides,
});

const makeSummary = (
  _id: string,
  workoutDays: WorkoutDay[],
  restDays: number,
): ProgramSummary => ({
  _id,
  name: _id,
  rotationCount: 1,
  sessionCount: workoutDays.length,
  restDays,
  curRotationIdx: 0,
  volume: 0,
  unit: "lbs",
  workoutDays,
});

const setToday = (y: number, mo: number, d: number) =>
  vi.setSystemTime(new Date(y, mo - 1, d, 9));

afterEach(() => {
  vi.useRealTimers();
});

describe("getStreak", () => {
  it("returns 0 with no workout days", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    expect(getStreak([{ restDays: 2, workoutDays: [] }])).toBe(0);
  });

  it("counts a single workout day, holding through its pending allowance", () => {
    vi.useFakeTimers();
    const program = { restDays: 1, workoutDays: [wd(at(2026, 1, 3))] };
    setToday(2026, 1, 3);
    expect(getStreak([program])).toBe(1);
    // Jan 4 passing without a workout spends the one allowed rest day.
    setToday(2026, 1, 5);
    expect(getStreak([program])).toBe(1);
    setToday(2026, 1, 6);
    expect(getStreak([program])).toBe(0);
  });

  it("counts consecutive workout days ending today", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 3);
    const program = {
      restDays: 0,
      workoutDays: [at(2026, 1, 1), at(2026, 1, 2), at(2026, 1, 3)].map((t) =>
        wd(t),
      ),
    };
    expect(getStreak([program])).toBe(3);
  });

  it("holds its value through allowed rest days — no dip before the next workout", () => {
    vi.useFakeTimers();
    // restDays 2, worked Jan 1/3/5: rest on Jan 2 and 4 spends the allowance
    // exactly, so the streak must read 3 through the morning of Jan 6.
    const program = {
      restDays: 2,
      workoutDays: [at(2026, 1, 1), at(2026, 1, 3), at(2026, 1, 5)].map((t) =>
        wd(t),
      ),
    };
    setToday(2026, 1, 5);
    expect(getStreak([program])).toBe(3);
    setToday(2026, 1, 6);
    expect(getStreak([program])).toBe(3);
  });

  it("drops straight to zero once the allowance is exceeded, instead of decaying", () => {
    vi.useFakeTimers();
    // Same shape as above; Jan 6 passing without a workout is a third rest
    // day, one over the allowance. The old walk decayed 3 → 2 → 1 → 0 across
    // Jan 7–9; the streak must be 0 for all of them.
    const program = {
      restDays: 2,
      workoutDays: [at(2026, 1, 1), at(2026, 1, 3), at(2026, 1, 5)].map((t) =>
        wd(t),
      ),
    };
    setToday(2026, 1, 7);
    expect(getStreak([program])).toBe(0);
    setToday(2026, 1, 8);
    expect(getStreak([program])).toBe(0);
    setToday(2026, 1, 9);
    expect(getStreak([program])).toBe(0);
  });

  it("attributes a break to the gap where it chronologically happened", () => {
    vi.useFakeTimers();
    // restDays 2, worked Jan 1/3/5/7: the third rest day (Jan 6) broke the
    // streak, so the Jan 7 workout starts a fresh streak of 1 — the old
    // backward walk wrongly kept 3 by discarding the oldest day instead.
    setToday(2026, 1, 7);
    const program = {
      restDays: 2,
      workoutDays: [
        at(2026, 1, 1),
        at(2026, 1, 3),
        at(2026, 1, 5),
        at(2026, 1, 7),
      ].map((t) => wd(t)),
    };
    expect(getStreak([program])).toBe(1);
  });

  it("restarts at 1 today when a zero-allowance gap precedes today's workout", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 3);
    const program = {
      restDays: 0,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 3))],
    };
    expect(getStreak([program])).toBe(1);
  });

  it("counts only the run since the most recent break", () => {
    vi.useFakeTimers();
    // Two separate breaks (Jan 2 and Jan 4 rest against an allowance of 0);
    // only the Jan 5–7 run survives.
    setToday(2026, 1, 7);
    const program = {
      restDays: 0,
      workoutDays: [
        at(2026, 1, 1),
        at(2026, 1, 3),
        at(2026, 1, 5),
        at(2026, 1, 6),
        at(2026, 1, 7),
      ].map((t) => wd(t)),
    };
    expect(getStreak([program])).toBe(3);
  });

  it("gives a restarted streak a fresh allowance for the pending gap", () => {
    vi.useFakeTimers();
    // The Jan 1 → Jan 4 gap breaks (2 rest days > 1) and restarts the count,
    // which must not inherit any spent rest: the pending Jan 6 rest day fits
    // the fresh allowance.
    setToday(2026, 1, 7);
    const program = {
      restDays: 1,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 4)), wd(at(2026, 1, 5))],
    };
    expect(getStreak([program])).toBe(2);
  });

  it("combines historical rest with the pending gap against one allowance", () => {
    vi.useFakeTimers();
    // Jan 2 rest already spent the allowance of 1, so the streak survives
    // while workouts keep coming — but the first pending rest day (Jan 5)
    // pushes the same segment over the line.
    const program = {
      restDays: 1,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 3)), wd(at(2026, 1, 4))],
    };
    setToday(2026, 1, 5);
    expect(getStreak([program])).toBe(3);
    setToday(2026, 1, 6);
    expect(getStreak([program])).toBe(0);
  });

  it("refreshes the allowance at a rotation boundary", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const program = {
      restDays: 1,
      workoutDays: [
        wd(at(2026, 1, 1), 0),
        wd(at(2026, 1, 2), 0),
        // Jan 3 rest is charged to rotation 1's fresh allowance.
        wd(at(2026, 1, 4), 1),
        wd(at(2026, 1, 5), 1),
      ],
    };
    expect(getStreak([program])).toBe(4);
  });

  it("does not charge rest from the previous rotation against the boundary gap", () => {
    vi.useFakeTimers();
    // Rotation 1 rests on Jan 3 (boundary) and Jan 5 (in-rotation): two rest
    // days against an allowance of 1, so the streak restarts at Jan 6.
    setToday(2026, 1, 6);
    const overspent = {
      restDays: 1,
      workoutDays: [
        wd(at(2026, 1, 1), 0),
        wd(at(2026, 1, 2), 0),
        wd(at(2026, 1, 4), 1),
        wd(at(2026, 1, 6), 1),
      ],
    };
    expect(getStreak([overspent])).toBe(1);

    // With an allowance of 2 the same layout survives intact.
    expect(getStreak([{ ...overspent, restDays: 2 }])).toBe(4);
  });

  it("breaks at a rotation boundary whose gap exceeds the new allowance", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 6);
    const program = {
      restDays: 1,
      workoutDays: [
        wd(at(2026, 1, 1), 0),
        wd(at(2026, 1, 2), 0),
        // Three rest days before rotation 1 starts.
        wd(at(2026, 1, 6), 1),
      ],
    };
    expect(getStreak([program])).toBe(1);
  });

  it("returns 0 when the pending gap alone exceeds the allowance", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 6);
    const program = {
      restDays: 1,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 2))],
    };
    expect(getStreak([program])).toBe(0);
  });

  it("continues a streak from a past program into the current one", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const past = {
      restDays: 0,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 2))],
    };
    const current = {
      restDays: 1,
      // Jan 3 rest is charged to the newer program's allowance.
      workoutDays: [wd(at(2026, 1, 4)), wd(at(2026, 1, 5))],
    };
    expect(getStreak([past, current])).toBe(4);
  });

  it("orders programs by their latest workout, not array position", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const past = {
      restDays: 0,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 2))],
    };
    const current = {
      restDays: 1,
      workoutDays: [wd(at(2026, 1, 4)), wd(at(2026, 1, 5))],
    };
    // Same fixture as the cross-program test, arrays reversed.
    expect(getStreak([current, past])).toBe(4);
  });

  it("judges the pending gap by the last-worked program's allowance", () => {
    vi.useFakeTimers();
    const past = {
      restDays: 2,
      workoutDays: [wd(at(2026, 1, 1)), wd(at(2026, 1, 2))],
    };
    const current = {
      restDays: 0,
      workoutDays: [wd(at(2026, 1, 3)), wd(at(2026, 1, 4))],
    };
    setToday(2026, 1, 5);
    expect(getStreak([past, current])).toBe(4);
    // One pending rest day: the current program's allowance of 0 governs,
    // not the past program's 2.
    setToday(2026, 1, 6);
    expect(getStreak([past, current])).toBe(0);
  });

  it("counts a day shared by two programs once", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 3);
    const past = { restDays: 0, workoutDays: [wd(at(2026, 1, 2))] };
    const current = {
      restDays: 0,
      workoutDays: [wd(at(2026, 1, 2)), wd(at(2026, 1, 3))],
    };
    expect(getStreak([past, current])).toBe(2);
  });

  it("assigns a day shared by two rotations to the newer rotation", () => {
    vi.useFakeTimers();
    // Jan 3 appears in rotations 0 and 1 (finished one, started the next the
    // same day) and must count for rotation 1: the Jan 2 rest is charged to
    // rotation 1's fresh allowance of 1, which the Jan 4 rest then exceeds.
    setToday(2026, 1, 5);
    const program = {
      restDays: 1,
      workoutDays: [
        wd(at(2026, 1, 1), 0),
        wd(at(2026, 1, 3), 0),
        wd(at(2026, 1, 3), 1),
        wd(at(2026, 1, 5), 1),
      ],
    };
    expect(getStreak([program])).toBe(1);
  });

  it("is independent of workoutDays ordering", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 3);
    const program = {
      restDays: 0,
      workoutDays: [at(2026, 1, 3), at(2026, 1, 1), at(2026, 1, 2)].map((t) =>
        wd(t),
      ),
    };
    expect(getStreak([program])).toBe(3);
  });

  it("groups raw completion times into local calendar days", () => {
    vi.useFakeTimers();
    // 23:30 and 08:00 are different local days even though a UTC grouping
    // would have collapsed them (23:30 CST is 05:30 UTC the next day).
    setToday(2026, 1, 2);
    const program = {
      restDays: 0,
      workoutDays: [wd(at(2026, 1, 1, 23, 30)), wd(at(2026, 1, 2, 8))],
    };
    expect(getStreak([program])).toBe(2);
  });

  it("treats the 25h day at the DST fall-back as a single day", () => {
    vi.useFakeTimers();
    // US DST ends Nov 1 2026 in America/Chicago.
    setToday(2026, 11, 1);
    const backToBack = {
      restDays: 0,
      workoutDays: [wd(at(2026, 10, 31)), wd(at(2026, 11, 1))],
    };
    expect(getStreak([backToBack])).toBe(2);

    // An exactly-at-allowance gap across the transition must not break.
    setToday(2026, 11, 2);
    const atAllowance = {
      restDays: 1,
      workoutDays: [wd(at(2026, 10, 31)), wd(at(2026, 11, 2))],
    };
    expect(getStreak([atAllowance])).toBe(2);
  });

  it("treats the 23h day at the DST spring-forward as a single day", () => {
    vi.useFakeTimers();
    // US DST starts Mar 8 2026 in America/Chicago.
    setToday(2026, 3, 8);
    const program = {
      restDays: 0,
      workoutDays: [wd(at(2026, 3, 7)), wd(at(2026, 3, 8))],
    };
    expect(getStreak([program])).toBe(2);
  });
});

describe("getMaxProgramStreak", () => {
  it("returns 0 with no workout days", () => {
    expect(getMaxProgramStreak([], 2)).toBe(0);
  });

  it("returns 1 for a single workout day", () => {
    expect(getMaxProgramStreak([wd(at(2026, 1, 1))], 0)).toBe(1);
  });

  it("keeps the best run when a later run is shorter", () => {
    const days = [
      wd(at(2026, 1, 1)),
      wd(at(2026, 1, 2)),
      wd(at(2026, 1, 3)),
      // break against an allowance of 0
      wd(at(2026, 1, 5)),
    ];
    expect(getMaxProgramStreak(days, 0)).toBe(3);
  });

  it("ignores the gap between the last workout and today", () => {
    // No fake timers: a long-finished program keeps its historical best
    // regardless of how much later it is viewed.
    const days = [wd(at(2026, 1, 1)), wd(at(2026, 1, 2))];
    expect(getMaxProgramStreak(days, 0)).toBe(2);
  });

  it("counts a day shared by two rotations once, as the newer rotation", () => {
    const days = [
      wd(at(2026, 1, 1), 0),
      wd(at(2026, 1, 1), 1),
      wd(at(2026, 1, 2), 1),
    ];
    expect(getMaxProgramStreak(days, 0)).toBe(2);
  });

  it("breaks at a rotation boundary whose gap exceeds the fresh allowance", () => {
    const days = [
      wd(at(2026, 1, 1), 0),
      wd(at(2026, 1, 2), 0),
      // two rest days before rotation 1, allowance 1
      wd(at(2026, 1, 5), 1),
    ];
    expect(getMaxProgramStreak(days, 1)).toBe(2);
  });

  it("is independent of workoutDays ordering", () => {
    const days = [wd(at(2026, 1, 3)), wd(at(2026, 1, 1)), wd(at(2026, 1, 2))];
    expect(getMaxProgramStreak(days, 0)).toBe(3);
  });

  it("returns the longest run within a program", () => {
    const days = [
      wd(at(2026, 1, 1)),
      wd(at(2026, 1, 2)),
      // break: two rest days against an allowance of 0
      wd(at(2026, 1, 5)),
      wd(at(2026, 1, 6)),
      wd(at(2026, 1, 7)),
    ];
    expect(getMaxProgramStreak(days, 0)).toBe(3);
  });

  it("refreshes the allowance at a rotation boundary before charging the gap", () => {
    // Rotation 0 already spent its rest day on Jan 2; the Jan 4 boundary rest
    // must be charged to rotation 1's fresh allowance, keeping the run alive.
    const days = [
      wd(at(2026, 1, 1), 0),
      wd(at(2026, 1, 3), 0),
      wd(at(2026, 1, 5), 1),
    ];
    expect(getMaxProgramStreak(days, 1)).toBe(3);
  });
});

describe("getRestDaysRemaining", () => {
  it("returns the full allowance when nothing is completed", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const program = makeProgram([[session(undefined)]], { restDays: 2 });
    expect(getRestDaysRemaining(program)).toBe(2);
  });

  it("treats a missing restDays as 0", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const program = makeProgram([[session(undefined)]]);
    delete program.restDays;
    expect(getRestDaysRemaining(program)).toBe(0);
  });

  it("returns the full allowance the day of a workout", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const program = makeProgram([[session(at(2026, 1, 5))]], { restDays: 2 });
    expect(getRestDaysRemaining(program)).toBe(2);
  });

  it("subtracts idle days since the rotation's workouts", () => {
    vi.useFakeTimers();
    // Worked Jan 1 and 2; Jan 3 passed idle.
    setToday(2026, 1, 4);
    const program = makeProgram(
      [[session(at(2026, 1, 1)), session(at(2026, 1, 2))]],
      { restDays: 2 },
    );
    expect(getRestDaysRemaining(program)).toBe(1);
  });

  it("clamps at zero once the allowance is exhausted", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    const program = makeProgram([[session(at(2026, 1, 1))]], { restDays: 2 });
    expect(getRestDaysRemaining(program)).toBe(0);
  });

  it("refreshes the allowance when a new rotation begins", () => {
    vi.useFakeTimers();
    // Rotation 0 spent its rest day on Jan 2; after advancing to rotation 1
    // the allowance is fresh, anchored at rotation 0's last workout.
    setToday(2026, 1, 4);
    const program = makeProgram(
      [[session(at(2026, 1, 1)), session(at(2026, 1, 3))], [session(undefined)]],
      { restDays: 1, curRotationIdx: 1 },
    );
    expect(getRestDaysRemaining(program)).toBe(1);
  });

  it("does not count current-rotation workout days as idle", () => {
    vi.useFakeTimers();
    // Anchor is Jan 2 (last of rotation 0); Jan 4 was worked in rotation 1,
    // so only Jan 3 counts as idle.
    setToday(2026, 1, 5);
    const program = makeProgram(
      [[session(at(2026, 1, 2))], [session(at(2026, 1, 4))]],
      { restDays: 2, curRotationIdx: 1 },
    );
    expect(getRestDaysRemaining(program)).toBe(1);
  });

  it("ignores fully-skipped sessions", () => {
    vi.useFakeTimers();
    setToday(2026, 1, 5);
    // completedDate set but no set completed: as if never worked.
    const program = makeProgram([[session(at(2026, 1, 1), false)]], {
      restDays: 2,
    });
    expect(getRestDaysRemaining(program)).toBe(2);
  });
});

describe("withCurrentProgram", () => {
  it("replaces the current program's summary with a live computation", () => {
    const pastDays = [wd(at(2026, 1, 1))];
    const summaries = [
      makeSummary("past", pastDays, 1),
      // Stale summary of the current program that must be dropped.
      makeSummary("cur", [], 0),
    ];
    const current = makeProgram([[session(at(2026, 1, 3))]], {
      _id: "cur",
      restDays: 2,
    });

    expect(withCurrentProgram(summaries, current)).toEqual([
      { workoutDays: pastDays, restDays: 1 },
      { workoutDays: [wd(at(2026, 1, 3))], restDays: 2 },
    ]);
  });

  it("handles missing summaries and a missing restDays", () => {
    const current = makeProgram([[session(at(2026, 1, 3))]], { _id: "cur" });
    delete current.restDays;

    expect(withCurrentProgram(undefined, current)).toEqual([
      { workoutDays: [wd(at(2026, 1, 3))], restDays: 0 },
    ]);
  });
});
