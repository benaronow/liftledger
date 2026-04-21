// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { startDb, stopDb, clearDb } from "./helpers";

vi.mock("@/lib/connectDB", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import { GET, PUT } from "@/app/api/block/[id]/route";
import UserModel from "@/lib/models/user";
import BlockModel from "@/lib/models/block";
import { Block } from "@/lib/types";

const makeUser = () => ({
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  birthday: new Date("1990-01-01"),
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

const getRequest = (id: string) =>
  new NextRequest(`http://localhost/api/block/${id}`);

const putRequest = (id: string, body: object) =>
  new NextRequest(`http://localhost/api/block/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("GET /api/block/[id]", () => {
  it("returns the block by id", async () => {
    const block = await BlockModel.create(makeBlock());

    const res = await GET(getRequest(block._id.toString()), makeParams(block._id.toString()));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data._id.toString()).toBe(block._id.toString());
    expect(data.name).toBe("Test Block");
  });

  it("returns null for a non-existent id", async () => {
    const fakeId = "000000000000000000000000";
    const res = await GET(getRequest(fakeId), makeParams(fakeId));
    const data = await res.json();

    expect(data).toBeNull();
  });
});

describe("PUT /api/block/[id] — day progression", () => {
  it("does not advance curDayIdx when curDay has no completedDate", async () => {
    const block = await BlockModel.create(makeBlock({ curDayIdx: 0 }));
    const user = await UserModel.create(makeUser());

    const res = await PUT(
      putRequest(block._id.toString(), {
        uid: user._id.toString(),
        block: { ...block.toObject(), curDayIdx: 0 },
      }),
      makeParams(block._id.toString()),
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
      putRequest(block._id.toString(), {
        uid: user._id.toString(),
        block: blockObj,
      }),
      makeParams(block._id.toString()),
    );
    const { block: updated } = await res.json();

    expect(updated.curDayIdx).toBe(1);
  });
});

describe("PUT /api/block/[id] — week progression", () => {
  it("creates next week and advances curWeekIdx when last day of week is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, curDayIdx: 0, length: 4 }),
    );
    const user = await UserModel.create(makeUser());

    const res = await PUT(
      putRequest(block._id.toString(), {
        uid: user._id.toString(),
        block: block.toObject(),
      }),
      makeParams(block._id.toString()),
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
      putRequest(block._id.toString(), {
        uid: user._id.toString(),
        block: block.toObject(),
      }),
      makeParams(block._id.toString()),
    );
    const { block: updated } = await res.json();

    const newWeekDay = updated.weeks[1][0];
    expect(newWeekDay.exercises[0].name).toBe("Bench Press");
    expect(newWeekDay.exercises[0].sets.length).toBe(2);
    expect(newWeekDay.exercises[0].sets[0].completed).toBe(false);
  });
});

describe("PUT /api/block/[id] — block completion", () => {
  it("returns done=true when last week's last day is complete", async () => {
    const block = await BlockModel.create(
      makeBlock({ weeks: [[makeDay(new Date())]], curWeekIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({ ...makeUser(), curBlock: block._id });
    await UserModel.findByIdAndUpdate(user._id, { curBlock: block._id });

    const res = await PUT(
      putRequest(block._id.toString(), {
        uid: user._id.toString(),
        block: block.toObject(),
      }),
      makeParams(block._id.toString()),
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
      putRequest(block._id.toString(), {
        uid: user._id.toString(),
        block: block.toObject(),
      }),
      makeParams(block._id.toString()),
    );

    const updated = await UserModel.findById(user._id);
    expect(updated!.curBlock).toBeUndefined();
  });
});
