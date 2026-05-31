import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import UserModel from "@liftledger/shared/models/user";
import BlockModel from "@liftledger/shared/models/block";
import { startDb, stopDb, clearDb, buildTestApp } from "./helpers";

const makeUser = () => ({
  auth0Id: "auth0|test-user",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  timerPresets: { 0: 30, 1: 60, 2: 90, 3: 120, 4: 180 },
  gyms: ["Gym A"],
  customExerciseNames: [],
  customExerciseApparatuses: [],
  blocks: [],
});

const makeBlock = () => ({
  name: "Test Block",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  weeks: [
    [
      {
        name: "Day 1",
        gym: "Gym A",
        exercises: [
          {
            name: "Bench Press",
            apparatus: "Barbell",
            gym: "Gym A",
            sets: [{ reps: 10, weight: 100, note: "", completed: false }],
            weightType: "lbs",
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curWeekIdx: 0,
  curDayIdx: 0,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("POST /users/:id/startBlock", () => {
  it("returns the updated user with curBlock set and the block in blocks", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();
    const app = await buildTestApp();

    const res = await app.inject({
      method: "POST",
      url: `/users/${uid}/startBlock`,
      payload: { block: makeBlock() },
    });
    const data = res.json();

    expect(res.statusCode).toBe(200);
    expect(data._id.toString()).toBe(uid);
    expect(data.curBlock).toBeDefined();
    // `blocks` is populated post-startBlock; assert via _id on each entry.
    expect(data.blocks.map((b: { _id: string }) => b._id.toString())).toContain(
      data.curBlock.toString(),
    );

    await app.close();
  });

  it("persists the block in the database", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();
    const app = await buildTestApp();

    const res = await app.inject({
      method: "POST",
      url: `/users/${uid}/startBlock`,
      payload: { block: makeBlock() },
    });
    const data = res.json();

    const found = await BlockModel.findById(data.curBlock);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test Block");

    await app.close();
  });

  it("sets curBlock on the user and adds to blocks array", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();
    const app = await buildTestApp();

    const res = await app.inject({
      method: "POST",
      url: `/users/${uid}/startBlock`,
      payload: { block: makeBlock() },
    });
    const data = res.json();

    const updated = await UserModel.findById(user._id);
    expect(updated!.curBlock!.toString()).toBe(data.curBlock.toString());
    expect(updated!.blocks.map((b) => b.toString())).toContain(
      data.curBlock.toString(),
    );

    await app.close();
  });
});
