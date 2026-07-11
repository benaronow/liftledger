import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import mongoose from "mongoose";
import UserModel from "@liftledger/shared/models/user";
import ProgramModel from "@liftledger/shared/models/program";
import type { Program } from "@liftledger/shared";
import { startDb, stopDb, clearDb, buildTestApp } from "./helpers";

const makeUser = () => ({
  auth0Id: "auth0|test-user",
  email: "test@example.com",
  username: "testuser",
  fullName: "Test User",
  timerSettings: { presets: { 0: 30, 1: 60, 2: 90, 3: 120, 4: 180 } },
  options: {
    gyms: ["Gym A"],
    exerciseNames: ["Bench Press", "Squat"],
    equipment: ["Barbell", "Dumbbell"],
    units: ["lbs"],
    defaultUnit: "lbs",
  },
  programs: [],
});

const makeExercise = (name = "Bench Press", equipment = "Barbell") => ({
  name,
  equipment,
  gym: "Gym A",
  workingSets: [{ reps: 10, weight: 100, note: "", completed: false }],
  unit: "lbs",
});

const makeProgram = (
  exercise = makeExercise(),
  overrides: Partial<Program> = {},
): Partial<Program> => ({
  name: "Test Program",
  length: 4,
  primaryGym: "Gym A",
  rotations: [
    [{ name: "Session 1", gym: "Gym A", exercises: [exercise], completedDate: undefined }],
  ],
  curRotationIdx: 0,
  curSessionIdx: 0,
  ...overrides,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

type App = Awaited<ReturnType<typeof buildTestApp>>;

const rename = (
  app: App,
  userId: string,
  segment: string,
  from: string,
  body: Record<string, unknown>,
) =>
  app.inject({
    method: "PATCH",
    url: `/users/${userId}/options/${segment}`,
    payload: { from, ...body },
  });

const add = (app: App, userId: string, segment: string, value: string) =>
  app.inject({
    method: "PUT",
    url: `/users/${userId}/options/${segment}`,
    payload: { value },
  });

const remove = (app: App, userId: string, segment: string, value: string) =>
  app.inject({
    method: "DELETE",
    url: `/users/${userId}/options/${segment}?value=${encodeURIComponent(value)}`,
  });

describe("PATCH /users/:id/<segment> (rename)", () => {
  it("scope=list renames the option only, leaving programs untouched", async () => {
    const program = await ProgramModel.create(makeProgram());
    const user = await UserModel.create({
      ...makeUser(),
      programs: [program._id],
      curProgram: program._id,
    });
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "exerciseNames", "Bench Press", {
      to: "Barbell Bench",
      scope: "list",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().options.exerciseNames).toContain("Barbell Bench");
    expect(res.json().options.exerciseNames).not.toContain("Bench Press");

    const prog = await ProgramModel.findById(program._id);
    expect(prog!.rotations[0][0].exercises[0].name).toBe("Bench Press");

    await app.close();
  });

  it("scope=current rewrites the current program only", async () => {
    const current = await ProgramModel.create(makeProgram());
    const other = await ProgramModel.create(makeProgram());
    const user = await UserModel.create({
      ...makeUser(),
      programs: [current._id, other._id],
      curProgram: current._id,
    });
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "exerciseNames", "Bench Press", {
      to: "Barbell Bench",
      scope: "current",
    });
    expect(res.statusCode).toBe(200);

    const cur = await ProgramModel.findById(current._id);
    const oth = await ProgramModel.findById(other._id);
    expect(cur!.rotations[0][0].exercises[0].name).toBe("Barbell Bench");
    expect(oth!.rotations[0][0].exercises[0].name).toBe("Bench Press");

    await app.close();
  });

  it("scope=all rewrites every program", async () => {
    const p1 = await ProgramModel.create(makeProgram());
    const p2 = await ProgramModel.create(makeProgram());
    const user = await UserModel.create({
      ...makeUser(),
      programs: [p1._id, p2._id],
      curProgram: p1._id,
    });
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "exerciseNames", "Bench Press", {
      to: "Barbell Bench",
      scope: "all",
    });
    expect(res.statusCode).toBe(200);

    expect((await ProgramModel.findById(p1._id))!.rotations[0][0].exercises[0].name).toBe("Barbell Bench");
    expect((await ProgramModel.findById(p2._id))!.rotations[0][0].exercises[0].name).toBe("Barbell Bench");

    await app.close();
  });

  it("renames equipment across a program", async () => {
    const program = await ProgramModel.create(
      makeProgram(makeExercise("Bench Press", "Barbell")),
    );
    const user = await UserModel.create({
      ...makeUser(),
      programs: [program._id],
      curProgram: program._id,
    });
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "equipment", "Barbell", {
      to: "Olympic Barbell",
      scope: "all",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().options.equipment).toContain("Olympic Barbell");

    const prog = await ProgramModel.findById(program._id);
    expect(prog!.rotations[0][0].exercises[0].equipment).toBe("Olympic Barbell");

    await app.close();
  });

  it("renames a gym across the list, sessions, exercises, and primaryGym", async () => {
    const program = await ProgramModel.create(makeProgram());
    const user = await UserModel.create({
      ...makeUser(),
      programs: [program._id],
      curProgram: program._id,
    });
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "gyms", "Gym A", {
      to: "Gym B",
      scope: "all",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().options.gyms).toContain("Gym B");
    expect(res.json().options.gyms).not.toContain("Gym A");

    const prog = await ProgramModel.findById(program._id);
    expect(prog!.primaryGym).toBe("Gym B");
    expect(prog!.rotations[0][0].gym).toBe("Gym B");
    expect(prog!.rotations[0][0].exercises[0].gym).toBe("Gym B");

    await app.close();
  });

  it("rejects a rename that collides with an existing entry", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "exerciseNames", "Bench Press", {
      to: "Squat",
      scope: "list",
    });
    expect(res.statusCode).toBe(409);

    await app.close();
  });

  it("rejects an invalid scope", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), "exerciseNames", "Bench Press", {
      to: "Barbell Bench",
      scope: "bogus",
    });
    expect(res.statusCode).toBe(400);

    await app.close();
  });

  it("returns 404 for an unknown option segment", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PATCH",
      url: `/users/${user._id.toString()}/options/bogus`,
      payload: { from: "Bench Press", to: "X", scope: "list" },
    });
    expect(res.statusCode).toBe(404);

    await app.close();
  });
});

describe("GET /users/:id/<segment>", () => {
  it("returns the option list sorted", async () => {
    const base = makeUser();
    const user = await UserModel.create({
      ...base,
      options: {
        ...base.options,
        exerciseNames: ["Squat", "Bench Press", "Deadlift"],
      },
    });
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/options/exerciseNames`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(["Bench Press", "Deadlift", "Squat"]);

    await app.close();
  });
});

describe("PUT /users/:id/<segment> (add)", () => {
  it("adds a new option", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await add(app, user._id.toString(), "exerciseNames", "Deadlift");
    expect(res.statusCode).toBe(200);
    expect(res.json().options.exerciseNames).toContain("Deadlift");

    await app.close();
  });

  it("is idempotent for a case-insensitive duplicate", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await add(app, user._id.toString(), "exerciseNames", "bench press");
    expect(res.statusCode).toBe(200);
    const names: string[] = res.json().options.exerciseNames;
    expect(names.filter((n) => n.toLowerCase() === "bench press")).toHaveLength(1);
    expect(names).toContain("Bench Press");

    await app.close();
  });
});

describe("DELETE /users/:id/<segment>", () => {
  it("removes an option", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await remove(app, user._id.toString(), "exerciseNames", "Squat");
    expect(res.statusCode).toBe(200);
    expect(res.json().options.exerciseNames).not.toContain("Squat");

    await app.close();
  });
});

describe("PUT /users/:id/options/units/default", () => {
  it("sets the default unit and adds it to the list when missing", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/options/units/default`,
      payload: { defaultUnit: "kg" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().options.defaultUnit).toBe("kg");
    expect(res.json().options.units).toContain("kg");

    await app.close();
  });
});

describe("GET /users/:id/timer/settings", () => {
  it("returns the user's timer settings", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/timer/settings`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().timerSettings.presets).toEqual({
      0: 30,
      1: 60,
      2: 90,
      3: 120,
      4: 180,
    });

    await app.close();
  });
});

describe("PATCH /users/:id/timer/settings", () => {
  it("merges the provided fields, leaving the rest intact", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PATCH",
      url: `/users/${user._id.toString()}/timer/settings`,
      payload: { patch: { defaultEnabled: false, defaultTime: 90 } },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().timerSettings.defaultTime).toBe(90);
    expect(res.json().timerSettings.defaultEnabled).toBe(false);
    // Untouched fields survive the partial update.
    expect(res.json().timerSettings.presets).toEqual({
      0: 30,
      1: 60,
      2: 90,
      3: 120,
      4: 180,
    });

    await app.close();
  });

  it("rejects a patch with no recognized fields", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PATCH",
      url: `/users/${user._id.toString()}/timer/settings`,
      payload: {},
    });
    expect(res.statusCode).toBe(400);

    await app.close();
  });
});

describe("option routes reject a mismatched caller", () => {
  it("returns 401 when the caller is not the target user", async () => {
    await UserModel.create(makeUser());
    const app = await buildTestApp();
    const otherId = new mongoose.Types.ObjectId().toString();

    const res = await add(app, otherId, "gyms", "Gym Z");
    expect(res.statusCode).toBe(401);

    await app.close();
  });
});
