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

import { POST } from "@/app/api/users/[id]/startBlock/route";
import UserModel from "@/lib/models/user";
import BlockModel from "@/lib/models/block";

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

const postRequest = (uid: string, body: object) =>
  new NextRequest(`http://localhost/api/users/${uid}/startBlock`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("POST /api/users/[id]/startBlock", () => {
  it("returns the updated user with curBlock set and the block in blocks", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();

    const res = await POST(
      postRequest(uid, { block: makeBlock() }),
      makeParams(uid),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data._id.toString()).toBe(uid);
    expect(data.curBlock).toBeDefined();
    expect(data.blocks.map((b: string) => b.toString())).toContain(
      data.curBlock.toString(),
    );
  });

  it("persists the block in the database", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();

    const res = await POST(
      postRequest(uid, { block: makeBlock() }),
      makeParams(uid),
    );
    const data = await res.json();

    const found = await BlockModel.findById(data.curBlock);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Test Block");
  });

  it("sets curBlock on the user and adds to blocks array", async () => {
    const user = await UserModel.create(makeUser());
    const uid = user._id.toString();

    const res = await POST(
      postRequest(uid, { block: makeBlock() }),
      makeParams(uid),
    );
    const data = await res.json();

    const updated = await UserModel.findById(user._id);
    expect(updated!.curBlock!.toString()).toBe(data.curBlock.toString());
    expect(updated!.blocks.map((b) => b.toString())).toContain(
      data.curBlock.toString(),
    );
  });
});
