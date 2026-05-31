import { authorizeCaller } from "@/lib/auth";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { Block, Day, Exercise, Set } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

interface BlockParams {
  params: Promise<{ id: string; blockId: string }>;
}

export const GET = async (req: NextRequest, { params }: BlockParams) => {
  const { id: uid, blockId } = await params;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  try {
    const block = await BlockModel.findOne({ _id: blockId });
    if (!block)
      return NextResponse.json({ error: "Block not found" }, { status: 404 });

    return NextResponse.json(block);
  } catch (error) {
    console.error("Failed to fetch block:", error);
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 },
    );
  }
};

export const PUT = async (req: NextRequest, { params }: BlockParams) => {
  const { id: uid, blockId } = await params;
  const auth = await authorizeCaller(uid);
  if (!auth.ok) return auth.response;

  const { block }: { block: Block; completedExercises: Exercise[] } =
    await req.json();

  const curDay: Day = block.weeks[block.curWeekIdx][block.curDayIdx];

  const isCurWeekDone =
    !!block.weeks[block.curWeekIdx][block.weeks[block.curWeekIdx].length - 1]
      .completedDate;

  const isCurBlockDone = block.curWeekIdx >= block.length - 1 && isCurWeekDone;

  const getLatestSet = (exercise: Exercise, idx: number): Set | null => {
    for (let w = block.weeks.length - 1; w >= 0; w--) {
      const week = block.weeks[w];
      for (let d = week.length - 1; d >= 0; d--) {
        const day = week[d];
        for (const e of day.exercises) {
          if (
            e.name === exercise.name &&
            e.apparatus === exercise.apparatus &&
            e.gym === block.primaryGym &&
            idx < e.sets.length
          ) {
            return e.sets[idx];
          }
        }
      }
    }

    return null;
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
                const latestSet = getLatestSet(exercise, idx) ?? set;
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

  let newBlock;
  try {
    newBlock = await BlockModel.findOneAndUpdate(
      { _id: blockId },
      { $set: blockToSet },
      { new: true },
    );
  } catch (error) {
    console.error("Failed to update block:", error);
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 },
    );
  }
  if (!newBlock)
    return NextResponse.json({ error: "Block not found" }, { status: 404 });

  if (isCurBlockDone) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: uid },
        { $unset: { curBlock: "" } },
        { new: true },
      );
    } catch (error) {
      console.error("Failed to clear curBlock on user:", error);
      return NextResponse.json(
        { error: "Failed to finish block" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ block: newBlock, done: isCurBlockDone });
};
