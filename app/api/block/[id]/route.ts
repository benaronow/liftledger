import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { Block, Day, Exercise, GetParams, Set } from "@/app/types";
import { checkIsBlockDone, checkIsCurWeekDone } from "@/app/utils";
import { NextRequest, NextResponse } from "next/server";

const createNextWeek = (curBlock: Block): Day[] => {
  const thisWeek = curBlock.weeks[curBlock.curWeekIdx];

  const getLatestExerciseOccurrence = (curBlock: Block, exercise: Exercise) => {
    for (const w of curBlock.weeks.toReversed().concat(curBlock.initialWeek)) {
      for (const d of w.toReversed()) {
        for (const e of d.exercises) {
          if (e.name === exercise.name && e.apparatus === exercise.apparatus)
            return e;
        }
      }
    }
  };

  return thisWeek.map((day) => ({
    name: day.name,
    exercises: day.exercises.map((exercise) => {
      const latestEx = getLatestExerciseOccurrence(curBlock, exercise);

      return latestEx
        ? {
            ...exercise,
            sets: latestEx?.sets.map((set: Set) => ({
              ...set,
              completed: false,
              note: "",
            })),
          }
        : exercise;
    }),
    completedDate: undefined,
  }));
};

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const block = await BlockModel.findOne({ _id: (await params).id });

  return NextResponse.json(block);
};

export const PUT = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const { uid, block }: { uid: string; block: Block } = await req.json();

  const curDay: Day = block.weeks[block.curWeekIdx][block.curDayIdx];

  const isCurWeekDone = checkIsCurWeekDone(block);

  const isCurBlockDone = checkIsBlockDone(block);

  const blockToSet = isCurBlockDone
    ? block
    : isCurWeekDone
    ? {
        ...block,
        weeks: [...block.weeks, createNextWeek(block)],
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
    { new: true }
  );

  if (newBlock && isCurBlockDone)
    await UserModel.findOneAndUpdate(
      { _id: uid },
      { $unset: { curBlock: "" } },
      { new: true }
    );

  return NextResponse.json({ block: newBlock, done: isCurBlockDone });
};
