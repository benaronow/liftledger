// @vitest-environment node
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import { NextRequest } from "next/server";
import { startDb, stopDb, clearDb } from "./helpers";

vi.mock("@/lib/connectDB", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: vi.fn().mockResolvedValue({
      user: { sub: "auth0|test-user" },
    }),
  },
}));

import { GET, PUT } from "@/app/api/users/[id]/blocks/[blockId]/route";
import UserModel from "@/lib/models/user";
import BlockModel from "@/lib/models/block";
import { Block } from "@/lib/types";

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

const getRequest = (uid: string, blockId: string) =>
  new NextRequest(`http://localhost/api/users/${uid}/blocks/${blockId}`);

const putRequest = (uid: string, blockId: string, body: object) =>
  new NextRequest(`http://localhost/api/users/${uid}/blocks/${blockId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

const makeParams = (id: string, blockId: string) => ({
  params: Promise.resolve({ id, blockId }),
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("GET /api/users/[id]/blocks/[blockId]", () => {
  it("returns the block by id", async () => {
    const user = await UserModel.create(makeUser());
    const block = await BlockModel.create(makeBlock());

    const res = await GET(
      getRequest(user._id.toString(), block._id.toString()),
      makeParams(user._id.toString(), block._id.toString()),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data._id.toString()).toBe(block._id.toString());
    expect(data.name).toBe("Test Block");
  });

  it("returns 404 for a non-existent block id", async () => {
    const user = await UserModel.create(makeUser());
    const fakeId = "000000000000000000000000";
    const res = await GET(
      getRequest(user._id.toString(), fakeId),
      makeParams(user._id.toString(), fakeId),
    );
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data).toEqual({ error: "Block not found" });
  });
});

describe("PUT /api/users/[id]/blocks/[blockId] — day progression", () => {
  it("does not advance curDayIdx when curDay has no completedDate", async () => {
    const block = await BlockModel.create(makeBlock({ curDayIdx: 0 }));
    const user = await UserModel.create(makeUser());

    const res = await PUT(
      putRequest(user._id.toString(), block._id.toString(), {
        block: { ...block.toObject(), curDayIdx: 0 },
      }),
      makeParams(user._id.toString(), block._id.toString()),
    );
    const { block: updated } = await res.json();

    expect(updated.curDayIdx).toBe(0);
  });

  it("advances curDayIdx when curDay has a completedDate", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date()), makeDay()]], curDayIdx: 0 }),
    );
    const user = await UserModel.create(makeUser());

    const blockObj = block.toObject();
    const res = await PUT(
      putRequest(user._id.toString(), block._id.toString(), {
        block: blockObj,
      }),
      makeParams(user._id.toString(), block._id.toString()),
    );
    const { block: updated } = await res.json();

    expect(updated.curDayIdx).toBe(1);
  });
});

describe("PUT /api/users/[id]/blocks/[blockId] — week progression", () => {
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

    const res = await PUT(
      putRequest(user._id.toString(), block._id.toString(), {
        block: block.toObject(),
      }),
      makeParams(user._id.toString(), block._id.toString()),
    );
    const { block: updated, done } = await res.json();

    expect(done).toBe(false);
    expect(updated.curWeekIdx).toBe(1);
    expect(updated.curDayIdx).toBe(0);
    expect(updated.weeks.length).toBe(2);
  });

  it("copies exercise structure into the new week", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 4 }),
    );
    const user = await UserModel.create(makeUser());

    const res = await PUT(
      putRequest(user._id.toString(), block._id.toString(), {
        block: block.toObject(),
      }),
      makeParams(user._id.toString(), block._id.toString()),
    );
    const { block: updated } = await res.json();

    const newWeekDay = updated.weeks[1][0];
    expect(newWeekDay.exercises[0].name).toBe("Bench Press");
    expect(newWeekDay.exercises[0].sets.length).toBe(2);
    expect(newWeekDay.exercises[0].sets[0].completed).toBe(false);
  });
});

describe("PUT /api/users/[id]/blocks/[blockId] — block completion", () => {
  it("returns done=true when last week's last day is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({ ...makeUser(), curBlock: block._id });
    await UserModel.findByIdAndUpdate(user._id, { curBlock: block._id });

    const res = await PUT(
      putRequest(user._id.toString(), block._id.toString(), {
        block: block.toObject(),
      }),
      makeParams(user._id.toString(), block._id.toString()),
    );
    const { done } = await res.json();

    expect(done).toBe(true);
  });

  it("unsets curBlock on user when block is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({ ...makeUser(), curBlock: block._id });

    await PUT(
      putRequest(user._id.toString(), block._id.toString(), {
        block: block.toObject(),
      }),
      makeParams(user._id.toString(), block._id.toString()),
    );

    const updated = await UserModel.findById(user._id);
    expect(updated!.curBlock).toBeUndefined();
  });
});
