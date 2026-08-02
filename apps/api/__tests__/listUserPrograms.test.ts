import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import { type Program } from "@liftledger/shared";
import { startDb, stopDb, clearDb, buildTestApp } from "./helpers";

const makeUser = (programs: { toString(): string }[] = []) => ({
  auth0Id: "auth0|test-user",
  email: "test@example.com",
  username: "testuser",
  fullName: "Test User",
  timer: { settings: { presets: { 0: 30, 1: 60, 2: 90, 3: 120, 4: 180 } } },
  options: { gyms: ["Gym A"], exerciseNames: [], equipment: [] },
  programs: programs.map((p) => p.toString()),
});

const makeExercise = (completed: boolean) => ({
  name: "Bench Press",
  equipment: "Barbell",
  gym: "Gym A",
  workingSets: [
    { reps: 10, weight: 100, note: "", completed },
    { reps: 10, weight: 100, note: "", completed },
  ],
  unit: "lbs",
});

const makeSession = (completedDate: Date | undefined, completed: boolean) => ({
  name: "Session 1",
  gym: "Gym A",
  exercises: [makeExercise(completed)],
  completedDate,
});

const makeProgram = (overrides: Partial<Program> = {}): Partial<Program> => ({
  name: "Test Program",
  length: 4,
  primaryGym: "Gym A",
  rotations: [[makeSession(new Date(), true)]],
  curRotationIdx: 0,
  curSessionIdx: 0,
  restDays: 2,
  ...overrides,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("GET /users/:id/programs — summaries", () => {
  it("returns compact summaries with server-computed volume and workoutDays", async () => {
    const completedDate = new Date("2026-01-10T18:00:00.000Z");
    const program = await ProgramModel.create(
      makeProgram({
        rotations: [
          [
            makeSession(completedDate, true), // completed, counts
            makeSession(undefined, false), // not completed
          ],
        ],
      }),
    );
    const user = await UserModel.create(makeUser([program._id]));
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/programs`,
    });
    const data = res.json();

    expect(res.statusCode).toBe(200);
    expect(data).toHaveLength(1);

    const summary = data[0];
    expect(summary._id).toBe(program._id.toString());
    expect(summary.name).toBe("Test Program");
    expect(summary.rotationCount).toBe(1);
    expect(summary.sessionCount).toBe(1); // only the completed session
    expect(summary.restDays).toBe(2);
    expect(summary.curRotationIdx).toBe(0);
    expect(summary.volume).toBe(2000); // 2 sets * 10 reps * 100 weight
    expect(summary.unit).toBe("lbs");
    expect(summary.workoutDays).toEqual([
      { time: completedDate.getTime(), rotationIdx: 0 },
    ]);

    await app.close();
  });

  it("excludes fully-skipped completed sessions from workoutDays", async () => {
    const program = await ProgramModel.create(
      makeProgram({
        // completedDate set but no set completed => fully skipped
        rotations: [[makeSession(new Date("2026-01-10T18:00:00Z"), false)]],
      }),
    );
    const user = await UserModel.create(makeUser([program._id]));
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/programs`,
    });
    const [summary] = res.json();

    expect(summary.workoutDays).toEqual([]);
    expect(summary.volume).toBe(0);

    await app.close();
  });

  it("returns 404 for a non-existent user", async () => {
    const app = await buildTestApp();
    const res = await app.inject({
      method: "GET",
      url: `/users/000000000000000000000000/programs`,
    });

    expect(res.statusCode).toBe(404);
    await app.close();
  });
});

describe("GET /users/me — programs as ids only", () => {
  it("carries programs as ids, never populated documents", async () => {
    const program = await ProgramModel.create(makeProgram());
    await UserModel.create(makeUser([program._id]));
    const app = await buildTestApp();

    const res = await app.inject({ method: "GET", url: `/users/me` });
    const data = res.json();

    expect(res.statusCode).toBe(200);
    expect(data.programs).toEqual([program._id.toString()]);
    // ids, not hydrated Program objects
    expect(typeof data.programs[0]).toBe("string");

    await app.close();
  });
});
