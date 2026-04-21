import { describe, it, expect } from "vitest";
import { computeProgress } from "@/app/complete-day/SetList/computeProgress";
import { Exercise } from "@/lib/types";

const done = (weight: number, reps: number) => ({
  weight,
  reps,
  note: "",
  completed: true,
  skipped: false,
});

const skipped = () => ({
  weight: 0,
  reps: 0,
  note: "",
  completed: false,
  skipped: true,
});

const pending = (weight: number, reps: number) => ({
  weight,
  reps,
  note: "",
  completed: false,
  skipped: false,
});

const ex = (
  name: string,
  gym: string,
  sets: ReturnType<typeof done | typeof skipped | typeof pending>[],
): Exercise => ({
  name,
  apparatus: "Barbell",
  gym,
  weightType: "lbs",
  sets,
});

// ─── Basic sign rules ────────────────────────────────────────────────────────

describe("getProgressSign — basic rules", () => {
  it("returns undefined when there is no history", () => {
    const current = ex("BB Bench", "Gym 1", [pending(100, 10)]);
    expect(computeProgress(0, current, [])).toBeUndefined();
  });

  it("returns 1 when reps increase with same weight", () => {
    const history = [ex("BB Bench", "Gym 1", [done(100, 10)])];
    const current = ex("BB Bench", "Gym 1", [pending(100, 11)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("returns 1 when weight increases with fewer reps", () => {
    // Weight takes priority over reps
    const history = [ex("BB Bench", "Gym 1", [done(25, 12)])];
    const current = ex("BB Bench", "Gym 1", [pending(30, 11)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("returns 1 when both weight and reps increase", () => {
    const history = [ex("BB Bench", "Gym 1", [done(100, 10)])];
    const current = ex("BB Bench", "Gym 1", [pending(110, 11)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("returns -1 when reps decrease with same weight", () => {
    const history = [ex("BB Bench", "Gym 1", [done(200, 8)])];
    const current = ex("BB Bench", "Gym 1", [pending(200, 7)]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("returns -1 when weight decreases with more reps", () => {
    const history = [ex("BB Row", "Gym 2", [done(7, 7)])];
    const current = ex("BB Row", "Gym 2", [pending(6, 7)]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("returns -1 when both weight and reps decrease", () => {
    const history = [ex("BB Bench", "Gym 2", [done(12, 12)])];
    const current = ex("BB Bench", "Gym 2", [pending(11, 11)]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("returns 0 when weight and reps are unchanged", () => {
    const history = [
      ex("DB Bicep Curl", "Gym 1", [done(25, 12), done(25, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 1", [
      pending(25, 12),
      pending(25, 12),
    ]);
    expect(computeProgress(1, current, history)).toBe(0);
  });

  it("uses most recent history entry when multiple are present", () => {
    const history = [
      ex("BB Bench", "Gym 1", [done(100, 11)]), // most recent
      ex("BB Bench", "Gym 1", [done(100, 10)]),
    ];
    const current = ex("BB Bench", "Gym 1", [pending(100, 11)]);
    expect(computeProgress(0, current, history)).toBe(0); // equal to most recent
  });
});

// ─── Gym isolation ───────────────────────────────────────────────────────────

describe("getProgressSign — gym isolation", () => {
  it("returns undefined when history is from a different gym (W3-A Gym 2 first visit)", () => {
    // Gym 1 history exists but current exercise is at Gym 2
    const history = [ex("BB Bench", "Gym 1", [done(100, 11)])];
    const current = ex("BB Bench", "Gym 2", [pending(1, 1)]);
    expect(computeProgress(0, current, history)).toBeUndefined();
  });

  it("returns undefined when history gym does not match in reverse", () => {
    const history = [ex("BB Bench", "Gym 2", [done(1, 1)])];
    const current = ex("BB Bench", "Gym 1", [pending(100, 11)]);
    expect(computeProgress(0, current, history)).toBeUndefined();
  });

  it("uses Gym 2 history when exercise is at Gym 2 (W5-A second Gym 2 visit)", () => {
    // W3-A had Gym 2 BB Bench set[0] = weight:1, reps:1
    // W5-A Gym 2 BB Bench set[0] = weight:2, reps:1 → weight up → +
    const history = [
      ex("BB Bench", "Gym 1", [done(100, 11)]), // should be ignored
      ex("BB Bench", "Gym 2", [done(1, 1)]), // should be used
    ];
    const current = ex("BB Bench", "Gym 2", [pending(2, 1)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });
});

// ─── Set index boundary conditions ───────────────────────────────────────────

describe("getProgressSign — set index handling", () => {
  it("returns undefined for a new addon set with no history at that index (W2-A DB Bicep Curl set c)", () => {
    // W1-A had only 2 sets; W2-A adds set[2] as addon
    const history = [
      ex("DB Bicep Curl", "Gym 1", [done(25, 12), done(25, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 1", [
      pending(30, 11),
      pending(25, 12),
      pending(30, 12),
    ]);
    expect(computeProgress(2, current, history)).toBeUndefined();
  });

  it("returns undefined when prior set at that index was skipped (W2-A Tricep Pushdown)", () => {
    // W1-A Tricep Pushdown sets were skipped → not completed → no valid history
    const history = [ex("Tricep Pushdown", "Gym 1", [skipped(), skipped()])];
    const current = ex("Tricep Pushdown", "Gym 1", [
      pending(35, 10),
      pending(35, 10),
    ]);
    expect(computeProgress(0, current, history)).toBeUndefined();
  });

  it("returns undefined when the history entry has fewer sets than setIdx", () => {
    const history = [ex("BB Bench", "Gym 1", [done(100, 10)])]; // only set[0]
    const current = ex("BB Bench", "Gym 1", [
      pending(100, 10),
      pending(100, 10),
    ]);
    expect(computeProgress(1, current, history)).toBeUndefined();
  });

  it("skips a history entry that lacks the set and finds an earlier one", () => {
    const history = [
      ex("BB Bench", "Gym 1", [done(100, 10)]), // set[1] missing
      ex("BB Bench", "Gym 1", [done(100, 10), done(90, 8)]), // set[1] present
    ];
    const current = ex("BB Bench", "Gym 1", [
      pending(100, 10),
      pending(100, 9),
    ]);
    // set[1]: prev=90w,8r → now 100w,9r → weight up → +
    expect(computeProgress(1, current, history)).toBe(1);
  });
});

// ─── Spreadsheet regression scenarios ────────────────────────────────────────

describe("getProgressSign — W1-A (first completion, no history)", () => {
  // All sets should be "e" (undefined) since there is no prior data.
  it("BB Bench set[0]: e", () => {
    const current = ex("BB Bench", "Gym 1", [pending(100, 10)]);
    expect(computeProgress(0, current, [])).toBeUndefined();
  });

  it("DB Bicep Curl set[0]: e", () => {
    const current = ex("DB Bicep Curl", "Gym 1", [
      pending(25, 12),
      pending(25, 12),
    ]);
    expect(computeProgress(0, current, [])).toBeUndefined();
  });
});

describe("getProgressSign — W2-A (second completion, W1-A in history)", () => {
  // W1-A actuals become the history for W2-A comparisons.

  it("BB Bench set[0]: + (reps 10→11, weight unchanged)", () => {
    const history = [ex("BB Bench", "Gym 1", [done(100, 10), done(100, 10)])];
    const current = ex("BB Bench", "Gym 1", [
      pending(100, 11),
      pending(100, 11),
    ]);
    expect(computeProgress(0, current, history)).toBe(1);
    expect(computeProgress(1, current, history)).toBe(1);
  });

  it("DB OHP set[0]: + (weight 45→50)", () => {
    const history = [ex("DB OHP", "Gym 1", [done(45, 8), done(45, 8)])];
    const current = ex("DB OHP", "Gym 1", [pending(50, 10), pending(50, 10)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("BB Row set[0]: - (reps 10→8, weight unchanged)", () => {
    const history = [ex("BB Row", "Gym 1", [done(200, 10), done(200, 10)])];
    const current = ex("BB Row", "Gym 1", [pending(200, 8), pending(200, 8)]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("DB Bicep Curl set[0]: + (weight 25→30 despite reps 12→11)", () => {
    const history = [
      ex("DB Bicep Curl", "Gym 1", [done(25, 12), done(25, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 1", [
      pending(30, 11),
      pending(25, 12),
      pending(30, 12),
    ]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("DB Bicep Curl set[1]: = (no change)", () => {
    const history = [
      ex("DB Bicep Curl", "Gym 1", [done(25, 12), done(25, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 1", [
      pending(30, 11),
      pending(25, 12),
      pending(30, 12),
    ]);
    expect(computeProgress(1, current, history)).toBe(0);
  });

  it("DB Bicep Curl set[2]: e (new addon set, no history at index 2)", () => {
    const history = [
      ex("DB Bicep Curl", "Gym 1", [done(25, 12), done(25, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 1", [
      pending(30, 11),
      pending(25, 12),
      pending(30, 12),
    ]);
    expect(computeProgress(2, current, history)).toBeUndefined();
  });

  it("Tricep Pushdown set[0]: e (W1-A sets were skipped, not completed)", () => {
    const history = [ex("Tricep Pushdown", "Gym 1", [skipped(), skipped()])];
    const current = ex("Tricep Pushdown", "Gym 1", [
      pending(35, 10),
      pending(35, 10),
    ]);
    expect(computeProgress(0, current, history)).toBeUndefined();
  });
});

describe("getProgressSign — W3-A (gym switch to Gym 2 for days 1 & 2)", () => {
  it("BB Bench set[0] at Gym 2: e (first visit, only Gym 1 history)", () => {
    const history = [
      ex("BB Bench", "Gym 1", [done(100, 11), done(100, 11)]),
      ex("BB Bench", "Gym 1", [done(100, 10), done(100, 10)]),
    ];
    const current = ex("BB Bench", "Gym 2", [pending(1, 1), pending(2, 2)]);
    expect(computeProgress(0, current, history)).toBeUndefined();
  });

  it("Adductors set[0] at Gym 1: + (weight 100→110, reps 10→11)", () => {
    // W2-A was first time for Adductors at Gym 1
    const history = [ex("Adductors", "Gym 1", [done(100, 10), done(110, 11)])];
    const current = ex("Adductors", "Gym 1", [
      pending(110, 11),
      pending(110, 11),
    ]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("Adductors set[1] at Gym 1: = (no change)", () => {
    const history = [ex("Adductors", "Gym 1", [done(100, 10), done(110, 11)])];
    const current = ex("Adductors", "Gym 1", [
      pending(110, 11),
      pending(110, 11),
    ]);
    expect(computeProgress(1, current, history)).toBe(0);
  });
});

describe("getProgressSign — W4-A (extra addon sets added mid-block)", () => {
  // Day 1: BB Bench now has 4 sets. Sets[0] and [1] existed before; [2] and [3] are new.
  // Last Gym 1 BB Bench completion was W2-A (W3-A day 1 was Gym 2).

  it("BB Bench set[0] at Gym 1: = (no change from W2-A)", () => {
    const history = [
      ex("BB Bench", "Gym 2", [done(1, 1), done(2, 2)]), // W3-A, different gym
      ex("BB Bench", "Gym 1", [done(100, 11), done(100, 11)]), // W2-A
      ex("BB Bench", "Gym 1", [done(100, 10), done(100, 10)]), // W1-A
    ];
    const current = ex("BB Bench", "Gym 1", [
      pending(100, 11),
      pending(100, 11),
      pending(100, 11),
      pending(100, 11),
    ]);
    expect(computeProgress(0, current, history)).toBe(0);
    expect(computeProgress(1, current, history)).toBe(0);
  });

  it("BB Bench set[2] at Gym 1: e (new addon, no history at index 2 for Gym 1)", () => {
    const history = [
      ex("BB Bench", "Gym 2", [done(1, 1), done(2, 2)]),
      ex("BB Bench", "Gym 1", [done(100, 11), done(100, 11)]),
    ];
    const current = ex("BB Bench", "Gym 1", [
      pending(100, 11),
      pending(100, 11),
      pending(100, 11),
      pending(100, 11),
    ]);
    expect(computeProgress(2, current, history)).toBeUndefined();
    expect(computeProgress(3, current, history)).toBeUndefined();
  });

  it("BB Row set[0] at Gym 1: + (weight 200→210)", () => {
    // Last Gym 1 BB Row was W2-A: 200w,7r
    const history = [
      ex("BB Row", "Gym 2", [done(7, 7), done(8, 8)]), // W3-A, different gym
      ex("BB Row", "Gym 1", [done(200, 7), done(200, 7)]), // W2-A
    ];
    const current = ex("BB Row", "Gym 1", [pending(210, 8), pending(200, 6)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("BB Row set[1] at Gym 1: - (reps 7→6, weight unchanged)", () => {
    const history = [
      ex("BB Row", "Gym 2", [done(7, 7), done(8, 8)]),
      ex("BB Row", "Gym 1", [done(200, 7), done(200, 7)]),
    ];
    const current = ex("BB Row", "Gym 1", [pending(210, 8), pending(200, 6)]);
    expect(computeProgress(1, current, history)).toBe(-1);
  });

  it("BB Squat at Gym 2: e (first Gym 2 visit for day 3)", () => {
    const history = [ex("BB Squat", "Gym 1", [done(290, 7), done(290, 7)])];
    const current = ex("BB Squat", "Gym 2", [pending(13, 13), pending(14, 14)]);
    expect(computeProgress(0, current, history)).toBeUndefined();
    expect(computeProgress(1, current, history)).toBeUndefined();
  });

  it("Crunch at Gym 2: e (first ever occurrence)", () => {
    const current = ex("Crunch", "Gym 2", [pending(50, 8)]);
    expect(computeProgress(0, current, [])).toBeUndefined();
  });
});

describe("getProgressSign — W5-A (second Gym 2 visit for days 1 & 2)", () => {
  // W3-A was the first Gym 2 visit. W5-A compares against W3-A.

  it("BB Bench at Gym 2 set[0]: + (weight 1→2)", () => {
    const history = [
      ex("BB Bench", "Gym 1", [done(100, 11), done(100, 11)]), // ignored (wrong gym)
      ex("BB Bench", "Gym 2", [done(1, 1), done(2, 2)]), // W3-A Gym 2
    ];
    const current = ex("BB Bench", "Gym 2", [pending(2, 1), pending(3, 2)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("BB Bench at Gym 2 set[1]: + (weight 2→3)", () => {
    const history = [ex("BB Bench", "Gym 2", [done(1, 1), done(2, 2)])];
    const current = ex("BB Bench", "Gym 2", [pending(2, 1), pending(3, 2)]);
    expect(computeProgress(1, current, history)).toBe(1);
  });

  it("BB Row at Gym 2 set[0]: - (weight 7→6)", () => {
    const history = [ex("BB Row", "Gym 2", [done(7, 7), done(8, 8)])];
    const current = ex("BB Row", "Gym 2", [pending(6, 7), pending(7, 8)]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("BB Row at Gym 2 set[1]: - (weight 8→7)", () => {
    const history = [ex("BB Row", "Gym 2", [done(7, 7), done(8, 8)])];
    const current = ex("BB Row", "Gym 2", [pending(6, 7), pending(7, 8)]);
    expect(computeProgress(1, current, history)).toBe(-1);
  });

  it("Lat Pulldown at Gym 2 set[0]: - (reps 10→9, weight unchanged)", () => {
    const history = [ex("Lat Pulldown", "Gym 2", [done(10, 10), skipped()])];
    const current = ex("Lat Pulldown", "Gym 2", [
      pending(10, 9),
      pending(1, 1),
    ]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("Lat Pulldown at Gym 2 set[1]: e (W3-A set[1] was skipped, not completed)", () => {
    const history = [ex("Lat Pulldown", "Gym 2", [done(10, 10), skipped()])];
    const current = ex("Lat Pulldown", "Gym 2", [
      pending(10, 9),
      pending(1, 1),
    ]);
    expect(computeProgress(1, current, history)).toBeUndefined();
  });

  it("DB Bicep Curl at Gym 2 set[0]: - (reps 11→10, weight unchanged)", () => {
    const history = [
      ex("DB Bicep Curl", "Gym 2", [done(11, 11), done(12, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 2", [
      pending(11, 10),
      pending(11, 11),
    ]);
    expect(computeProgress(0, current, history)).toBe(-1);
  });

  it("DB Bicep Curl at Gym 2 set[1]: - (weight 12→11, reps 12→11)", () => {
    const history = [
      ex("DB Bicep Curl", "Gym 2", [done(11, 11), done(12, 12)]),
    ];
    const current = ex("DB Bicep Curl", "Gym 2", [
      pending(11, 10),
      pending(11, 11),
    ]);
    expect(computeProgress(1, current, history)).toBe(-1);
  });

  it("BB Squat at Gym 2 set[0]: = (weight and reps unchanged from W4-A)", () => {
    // W4-A Gym 2 day 3: BB Squat weight=13, reps=13
    const history = [ex("BB Squat", "Gym 2", [done(13, 13), done(14, 14)])];
    const current = ex("BB Squat", "Gym 2", [pending(13, 13), pending(14, 14)]);
    expect(computeProgress(0, current, history)).toBe(0);
    expect(computeProgress(1, current, history)).toBe(0);
  });

  it("Hamstring Curl at Gym 2 set[0]: + (weight 15→16, reps 15→16)", () => {
    // W4-A Gym 2 day 3: Hamstring Curl weight=15, reps=15
    const history = [
      ex("Hamstring Curl", "Gym 2", [done(15, 15), done(16, 16)]),
    ];
    const current = ex("Hamstring Curl", "Gym 2", [pending(16, 16)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("Adductors at Gym 2: e (never done at Gym 2, only at Gym 1)", () => {
    const history = [ex("Adductors", "Gym 1", [done(110, 11), done(110, 11)])];
    const current = ex("Adductors", "Gym 2", [
      pending(20, 20),
      pending(20, 20),
    ]);
    expect(computeProgress(0, current, history)).toBeUndefined();
    expect(computeProgress(1, current, history)).toBeUndefined();
  });

  it("Leg Raises at Gym 2 set[0]: + (weight 0→5, W3-A was first occurrence)", () => {
    // W3-A: Leg Raises Gym 2 set[0] weight=0, reps=14
    const history = [ex("Leg Raises", "Gym 2", [done(0, 14)])];
    const current = ex("Leg Raises", "Gym 2", [pending(5, 14)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("Crunch at Gym 2 set[0]: + (reps 8→10, W4-A was first occurrence)", () => {
    // W4-A: Crunch Gym 2 set[0] weight=50, reps=8
    const history = [ex("Crunch", "Gym 2", [done(50, 8)])];
    const current = ex("Crunch", "Gym 2", [pending(50, 10), pending(50, 10)]);
    expect(computeProgress(0, current, history)).toBe(1);
  });

  it("Crunch at Gym 2 set[1]: e (W4-A only had one set)", () => {
    const history = [ex("Crunch", "Gym 2", [done(50, 8)])];
    const current = ex("Crunch", "Gym 2", [pending(50, 10), pending(50, 10)]);
    expect(computeProgress(1, current, history)).toBeUndefined();
  });
});
