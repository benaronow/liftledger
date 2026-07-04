import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
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
  gyms: ["Gym A"],
  exerciseNames: ["Bench Press", "Squat"],
  exerciseEquipment: ["Barbell", "Dumbbell"],
  programs: [],
});

const makeExercise = (name = "Bench Press", equipment = "Barbell") => ({
  name,
  equipment,
  gym: "Gym A",
  sets: [{ reps: 10, weight: 100, note: "", completed: false }],
  weightType: "lbs",
});

const makeProgram = (
  exercise = makeExercise(),
  overrides: Partial<Program> = {},
): Partial<Program> => ({
  name: "Test Program",
  length: 4,
  primaryGym: "Gym A",
  rotations: [[{ name: "Session 1", gym: "Gym A", exercises: [exercise], completedDate: undefined }]],
  curRotationIdx: 0,
  curSessionIdx: 0,
  ...overrides,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

const rename = (
  app: Awaited<ReturnType<typeof buildTestApp>>,
  userId: string,
  body: Record<string, unknown>,
) =>
  app.inject({
    method: "PUT",
    url: `/users/${userId}/renameExercise`,
    payload: body,
  });

describe("PUT /users/:id/renameExercise", () => {
  it("scope=list renames the option only, leaving programs untouched", async () => {
    const program = await ProgramModel.create(makeProgram());
    const user = await UserModel.create({
      ...makeUser(),
      programs: [program._id],
      curProgram: program._id,
    });
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), {
      field: "name",
      from: "Bench Press",
      to: "Barbell Bench",
      scope: "list",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().exerciseNames).toContain("Barbell Bench");
    expect(res.json().exerciseNames).not.toContain("Bench Press");

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

    const res = await rename(app, user._id.toString(), {
      field: "name",
      from: "Bench Press",
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

    const res = await rename(app, user._id.toString(), {
      field: "name",
      from: "Bench Press",
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

    const res = await rename(app, user._id.toString(), {
      field: "equipment",
      from: "Barbell",
      to: "Olympic Barbell",
      scope: "all",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().exerciseEquipment).toContain("Olympic Barbell");

    const prog = await ProgramModel.findById(program._id);
    expect(prog!.rotations[0][0].exercises[0].equipment).toBe("Olympic Barbell");

    await app.close();
  });

  it("rejects a rename that collides with an existing entry", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), {
      field: "name",
      from: "Bench Press",
      to: "Squat",
      scope: "list",
    });
    expect(res.statusCode).toBe(409);

    await app.close();
  });

  it("rejects an invalid request body", async () => {
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await rename(app, user._id.toString(), {
      field: "bogus",
      from: "Bench Press",
      to: "X",
      scope: "list",
    });
    expect(res.statusCode).toBe(400);

    await app.close();
  });
});
