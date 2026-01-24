import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { Block, Day, Exercise, GetParams, Set } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const block = await BlockModel.findOne({ _id: (await params).id });

  return NextResponse.json(block);
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const {
    uid,
    block,
    completedExercises,
  }: { uid: string; block: Block; completedExercises: Exercise[] } =
    await req.json();

  const curDay: Day = block.weeks[block.curWeekIdx][block.curDayIdx];

  const isCurWeekDone =
    !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
      .completedDate;

  const isCurBlockDone = block.curWeekIdx >= block.length - 1 && isCurWeekDone;

  const getCurrentLatestSet = (exercise: Exercise, idx: number) => {
    return block.weeks[block.curWeekIdx][block.curDayIdx].exercises.find(
      (e: Exercise) =>
        e.name === exercise.name &&
        e.apparatus === exercise.apparatus &&
        e.gym === block.primaryGym &&
        e.sets[idx] &&
        !e.sets[idx].skipped,
    )?.sets[idx];
  };

  const getLatestSet = (exercise: Exercise, idx: number) => {
    return completedExercises.find(
      (e: Exercise) =>
        e.name === exercise.name &&
        e.apparatus === exercise.apparatus &&
        e.gym === block.primaryGym &&
        e.sets[idx] &&
        !e.sets[idx].skipped,
    )?.sets[idx];
  };

  const createNextWeek = (): Day[] => {
    return block.weeks[block.curWeekIdx].map((day) => ({
      name: day.name,
      gym: block.primaryGym,
      exercises: day.exercises
        .filter((exercise) => !exercise.addedOn)
        .map((exercise) => {
          return {
            ...exercise,
            gym: block.primaryGym,
            sets: exercise.sets
              .filter((set) => !set.addedOn)
              .map((set: Set, idx: number) => {
                const latestSet =
                  getCurrentLatestSet(exercise, idx) ??
                  getLatestSet(exercise, idx) ??
                  set;
                return {
                  ...latestSet,
                  completed: false,
                  skipped: false,
                  note: "",
                };
              }),
          };
        }),
      completedDate: undefined,
    }));
  };

  const blockToSet = isCurBlockDone
    ? block
    : isCurWeekDone
      ? {
          ...block,
          weeks: [...block.weeks, createNextWeek()],
          curDayIdx: 0,
          curWeekIdx: block.curWeekIdx + 1,
        }
      : {
          ...block,
          curDayIdx: block.curDayIdx + (curDay.completedDate ? 1 : 0),
        };

  const newBlock = await BlockModel.findOneAndUpdate(
    { _id: (await params).id },
    { $set: blockToSet },
    { new: true },
  );

  if (newBlock && isCurBlockDone)
    await UserModel.findOneAndUpdate(
      { _id: uid },
      { $unset: { curBlock: "" } },
      { new: true },
    );

  return NextResponse.json({ block: newBlock, done: isCurBlockDone });
};
