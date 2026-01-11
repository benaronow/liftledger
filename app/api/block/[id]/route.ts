import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { Block, Day, Exercise, GetParams, Set } from "@/lib/types";
import {
  checkIsBlockDone,
  checkIsCurWeekDone,
  findLatestOccurrence,
} from "@/lib/blockUtils";
import { NextRequest, NextResponse } from "next/server";

const createNextWeek = (curBlock: Block): Day[] => {
  const thisWeek = curBlock.weeks[curBlock.curWeekIdx];

  const getLatestSet = (exercise: Exercise, set: Set, idx: number) => {
    return (
      findLatestOccurrence(curBlock, (e: Exercise) => {
        if (
          e.name === exercise.name &&
          e.apparatus === exercise.apparatus &&
          !e.sets[idx].skipped
        )
          return e.sets[idx];
      }) ?? set
    );
  };

  return thisWeek.map((day) => ({
    name: day.name,
    exercises: day.exercises
      .filter((exercise) => !exercise.addedOn)
      .map((exercise) => {
        return {
          ...exercise,
          sets: exercise.sets
            .filter((set) => !set.addedOn)
            .map((set: Set, idx: number) => {
              const latestSet = getLatestSet(exercise, set, idx);
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
