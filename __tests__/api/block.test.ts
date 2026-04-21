// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { startDb, stopDb, clearDb } from "./helpers";

vi.mock("@/lib/connectDB", () => ({
  connectDB: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/block/route";
import UserModel from "@/lib/models/user";
import BlockModel from "@/lib/models/block";

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

const postRequest = (body: object) =>
  new NextRequest("http://localhost/api/block", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("POST /api/block", () => {
  it("creates a block document and returns it", async () => {
    const user = await UserModel.create(makeUser());
    const block = makeBlock();

    const res = await POST(postRequest({ uid: user._id.toString(), block }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Test Block");
    expect(data._id).toBeDefined();
  });

  it("persists the block in the database", async () => {
    const user = await UserModel.create(makeUser());

    const res = await POST(postRequest({ uid: user._id.toString(), block: makeBlock() }));
    const data = await res.json();

    const found = await BlockModel.findById(data._id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test Block");
  });

  it("sets curBlock on the user and adds to blocks array", async () => {
    const user = await UserModel.create(makeUser());

    const res = await POST(postRequest({ uid: user._id.toString(), block: makeBlock() }));
    const data = await res.json();

    const updated = await UserModel.findById(user._id);
    expect(updated!.curBlock!.toString()).toBe(data._id.toString());
    expect(updated!.blocks.map((b) => b.toString())).toContain(
      data._id.toString(),
    );
  });
});
