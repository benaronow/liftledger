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
import type { Block } from "@liftledger/shared";
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

const makeExercise = () => ({
  name: "Bench Press",
  apparatus: "Barbell",
  gym: "Gym A",
  sets: [
    { reps: 10, weight: 100, note: "", completed: false },
    { reps: 10, weight: 100, note: "", completed: false },
  ],
  weightType: "lbs",
});

const makeDay = (completedDate?: Date) => ({
  name: "Day 1",
  gym: "Gym A",
  exercises: [makeExercise()],
  completedDate,
});

const makeBlock = (overrides: Partial<Block> = {}): Partial<Block> => ({
  name: "Test Block",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  weeks: [[makeDay()]],
  curWeekIdx: 0,
  curDayIdx: 0,
  ...overrides,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("GET /users/:id/blocks/:blockId", () => {
  it("returns the block by id", async () => {
    const user = await UserModel.create(makeUser());
    const block = await BlockModel.create(makeBlock());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
    });
    const data = res.json();

    expect(res.statusCode).toBe(200);
    expect(data._id.toString()).toBe(block._id.toString());
    expect(data.name).toBe("Test Block");

    await app.close();
  });

  it("returns 404 for a non-existent block id", async () => {
    const user = await UserModel.create(makeUser());
    const fakeId = "000000000000000000000000";
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/blocks/${fakeId}`,
    });
    const data = res.json();

    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Block not found" });

    await app.close();
  });
});

describe("PUT /users/:id/blocks/:blockId — day progression", () => {
  it("does not advance curDayIdx when curDay has no completedDate", async () => {
    const block = await BlockModel.create(makeBlock({ curDayIdx: 0 }));
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
      payload: {
        block: { ...block.toObject(), curDayIdx: 0 },
      },
    });
    const { block: updated } = res.json();

    expect(updated.curDayIdx).toBe(0);

    await app.close();
  });

  it("advances curDayIdx when curDay has a completedDate", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date()), makeDay()]], curDayIdx: 0 }),
    );
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const blockObj = block.toObject();
    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
      payload: { block: blockObj },
    });
    const { block: updated } = res.json();

    expect(updated.curDayIdx).toBe(1);

    await app.close();
  });
});

describe("PUT /users/:id/blocks/:blockId — week progression", () => {
  it("creates next week and advances curWeekIdx when last day of week is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({
        weeks: [[makeDay(new Date())]],
        curWeekIdx: 0,
        curDayIdx: 0,
        length: 4,
      }),
    );
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
      payload: { block: block.toObject() },
    });
    const { block: updated, done } = res.json();

    expect(done).toBe(false);
    expect(updated.curWeekIdx).toBe(1);
    expect(updated.curDayIdx).toBe(0);
    expect(updated.weeks.length).toBe(2);

    await app.close();
  });

  it("copies exercise structure into the new week", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 4 }),
    );
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
      payload: { block: block.toObject() },
    });
    const { block: updated } = res.json();

    const newWeekDay = updated.weeks[1][0];
    expect(newWeekDay.exercises[0].name).toBe("Bench Press");
    expect(newWeekDay.exercises[0].sets.length).toBe(2);
    expect(newWeekDay.exercises[0].sets[0].completed).toBe(false);

    await app.close();
  });
});

describe("PUT /users/:id/blocks/:blockId — block completion", () => {
  it("returns done=true when last week's last day is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({
      ...makeUser(),
      curBlock: block._id,
    });
    await UserModel.findByIdAndUpdate(user._id, { curBlock: block._id });
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
      payload: { block: block.toObject() },
    });
    const { done } = res.json();

    expect(done).toBe(true);

    await app.close();
  });

  it("unsets curBlock on user when block is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({
      ...makeUser(),
      curBlock: block._id,
    });
    const app = await buildTestApp();

    await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/blocks/${block._id.toString()}`,
      payload: { block: block.toObject() },
    });

    const updated = await UserModel.findById(user._id);
    expect(updated!.curBlock).toBeUndefined();

    await app.close();
  });
});
