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
  timerPresets: { 0: 30, 1: 60, 2: 90, 3: 120, 4: 180 },
  gyms: ["Gym A"],
  customExerciseNames: [],
  customExerciseApparatuses: [],
  programs: [],
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

const makeSession = (completedDate?: Date) => ({
  name: "Session 1",
  gym: "Gym A",
  exercises: [makeExercise()],
  completedDate,
});

const makeProgram = (overrides: Partial<Program> = {}): Partial<Program> => ({
  name: "Test Program",
  startDate: new Date("2024-01-01"),
  length: 4,
  primaryGym: "Gym A",
  rotations: [[makeSession()]],
  curRotationIdx: 0,
  curSessionIdx: 0,
  ...overrides,
});

beforeAll(startDb);
afterAll(stopDb);
afterEach(clearDb);

describe("GET /users/:id/programs/:programId", () => {
  it("returns the program by id", async () => {
    const user = await UserModel.create(makeUser());
    const program = await ProgramModel.create(makeProgram());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
    });
    const data = res.json();

    expect(res.statusCode).toBe(200);
    expect(data._id.toString()).toBe(program._id.toString());
    expect(data.name).toBe("Test Program");

    await app.close();
  });

  it("returns 404 for a non-existent program id", async () => {
    const user = await UserModel.create(makeUser());
    const fakeId = "000000000000000000000000";
    const app = await buildTestApp();

    const res = await app.inject({
      method: "GET",
      url: `/users/${user._id.toString()}/programs/${fakeId}`,
    });
    const data = res.json();

    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Program not found" });

    await app.close();
  });
});

describe("PUT /users/:id/programs/:programId — session progression", () => {
  it("does not advance curSessionIdx when curSession has no completedDate", async () => {
    const program = await ProgramModel.create(makeProgram({ curSessionIdx: 0 }));
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
      payload: {
        program: { ...program.toObject(), curSessionIdx: 0 },
      },
    });
    const { program: updated } = res.json();

    expect(updated.curSessionIdx).toBe(0);

    await app.close();
  });

  it("advances curSessionIdx when curSession has a completedDate", async () => {
    const program = await ProgramModel.create(
      makeProgram({ rotations: [[makeSession(new Date()), makeSession()]], curSessionIdx: 0 }),
    );
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const programObj = program.toObject();
    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
      payload: { program: programObj },
    });
    const { program: updated } = res.json();

    expect(updated.curSessionIdx).toBe(1);

    await app.close();
  });
});

describe("PUT /users/:id/programs/:programId — rotation progression", () => {
  it("creates next rotation and advances curRotationIdx when last session of rotation is complete", async () => {
    const program = await ProgramModel.create(
      makeProgram({
        rotations: [[makeSession(new Date())]],
        curRotationIdx: 0,
        curSessionIdx: 0,
        length: 4,
      }),
    );
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
      payload: { program: program.toObject() },
    });
    const { program: updated, done } = res.json();

    expect(done).toBe(false);
    expect(updated.curRotationIdx).toBe(1);
    expect(updated.curSessionIdx).toBe(0);
    expect(updated.rotations.length).toBe(2);

    await app.close();
  });

  it("copies exercise structure into the new rotation", async () => {
    const program = await ProgramModel.create(
      makeProgram({ rotations: [[makeSession(new Date())]], curRotationIdx: 0, length: 4 }),
    );
    const user = await UserModel.create(makeUser());
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
      payload: { program: program.toObject() },
    });
    const { program: updated } = res.json();

    const newRotationSession = updated.rotations[1][0];
    expect(newRotationSession.exercises[0].name).toBe("Bench Press");
    expect(newRotationSession.exercises[0].sets.length).toBe(2);
    expect(newRotationSession.exercises[0].sets[0].completed).toBe(false);

    await app.close();
  });
});

describe("PUT /users/:id/programs/:programId — program completion", () => {
  it("returns done=true when last rotation's last session is complete", async () => {
    const program = await ProgramModel.create(
      makeProgram({ rotations: [[makeSession(new Date())]], curRotationIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({
      ...makeUser(),
      curProgram: program._id,
    });
    await UserModel.findByIdAndUpdate(user._id, { curProgram: program._id });
    const app = await buildTestApp();

    const res = await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
      payload: { program: program.toObject() },
    });
    const { done } = res.json();

    expect(done).toBe(true);

    await app.close();
  });

  it("unsets curProgram on user when program is complete", async () => {
    const program = await ProgramModel.create(
      makeProgram({ rotations: [[makeSession(new Date())]], curRotationIdx: 0, length: 1 }),
    );
    const user = await UserModel.create({
      ...makeUser(),
      curProgram: program._id,
    });
    const app = await buildTestApp();

    await app.inject({
      method: "PUT",
      url: `/users/${user._id.toString()}/programs/${program._id.toString()}`,
      payload: { program: program.toObject() },
    });

    const updated = await UserModel.findById(user._id);
    expect(updated!.curProgram).toBeUndefined();

    await app.close();
  });
});
