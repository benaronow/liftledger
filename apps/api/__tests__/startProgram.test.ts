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
import { startDb, stopDb, clearDb, buildTestApp } from "./helpers";

const makeUser = () => ({
  auth0Id: "auth0|test-user",
  email: "test@example.com",
  username: "testuser",
  fullName: "Test User",
  timerPresets: { 0: 30, 1: 60, 2: 90, 3: 120, 4: 180 },
  gyms: ["Gym A"],
  customExerciseNames: [],
  customExerciseEquipment: [],
  programs: [],
});

const makeProgram = () => ({
  name: "Test Program",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  rotations: [
    [
      {
        name: "Session 1",
        gym: "Gym A",
        exercises: [
          {
            name: "Bench Press",
            equipment: "Barbell",
            gym: "Gym A",
            sets: [{ reps: 10, weight: 100, note: "", completed: false }],
            weightType: "lbs",
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curRotationIdx: 0,
  curSessionIdx: 0,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("POST /users/:id/startProgram", () => {
  it("returns the updated user with curProgram set and the program in programs", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();
    const app = await buildTestApp();

    const res = await app.inject({
      method: "POST",
      url: `/users/${uid}/startProgram`,
      payload: { program: makeProgram() },
    });
    const data = res.json();

    expect(res.statusCode).toBe(200);
    expect(data._id.toString()).toBe(uid);
    expect(data.curProgram).toBeDefined();
    // `programs` is populated post-startProgram; assert via _id on each entry.
    expect(data.programs.map((b: { _id: string }) => b._id.toString())).toContain(
      data.curProgram.toString(),
    );

    await app.close();
  });

  it("persists the program in the database", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();
    const app = await buildTestApp();

    const res = await app.inject({
      method: "POST",
      url: `/users/${uid}/startProgram`,
      payload: { program: makeProgram() },
    });
    const data = res.json();

    const found = await ProgramModel.findById(data.curProgram);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test Program");

    await app.close();
  });

  it("sets curProgram on the user and adds to programs array", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();
    const app = await buildTestApp();

    const res = await app.inject({
      method: "POST",
      url: `/users/${uid}/startProgram`,
      payload: { program: makeProgram() },
    });
    const data = res.json();

    const updated = await UserModel.findById(user._id);
    expect(updated!.curProgram!.toString()).toBe(data.curProgram.toString());
    expect(updated!.programs.map((b) => b.toString())).toContain(
      data.curProgram.toString(),
    );

    await app.close();
  });
});
