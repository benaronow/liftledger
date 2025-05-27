import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { checkIsBlockDone, checkIsCurWeekDone } from "@/app/utils";
import { Block, BlockOp, Day, Exercise, Set, Week } from "@/types";
import { NextRequest, NextResponse } from "next/server";

const createNextWeek = (curBlock: Block): Week => {
  const thisWeek = curBlock.weeks[curBlock.curWeekIdx];

  const getLatestExerciseOccurrence = (curBlock: Block, exercise: Exercise) => {
    for (const w of curBlock.weeks.toReversed().concat(curBlock.initialWeek)) {
      for (const d of w.days.toReversed()) {
        for (const e of d.exercises) {
          if (e.name === exercise.name && e.apparatus === exercise.apparatus)
            return e;
        }
      }
    }
  };

  return {
    number: thisWeek.number + 1,
    days: thisWeek.days.map((day) => {
      return {
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
      } as Day;
    }),
  };
};

export const POST = async (req: NextRequest) => {
  await connectDB();

  const { uid, block, type }: { uid: string; block: Block; type: BlockOp } =
    await req.json();

  if (type === BlockOp.Create) {
    const newBlock = await BlockModel.create(block);

    await UserModel.findOneAndUpdate(
      { _id: uid },
      { $set: { curBlock: newBlock }, $addToSet: { blocks: newBlock } },
      { new: true }
    );

    return NextResponse.json(newBlock);
  }

  if (type === BlockOp.Edit) {
    const curDay: Day = block.weeks[block.curWeekIdx].days[block.curDayIdx];

    const isCurWeekDone = checkIsCurWeekDone(block);

    const isCurBlockDone = checkIsBlockDone(block);

    const blockToSet = isCurBlockDone
      ? {
          ...block,
          weeks: [
            ...block.weeks.toSpliced(block.curWeekIdx, 1, {
              ...block.weeks[block.curWeekIdx],
            }),
          ],
        }
      : isCurWeekDone
      ? {
          ...block,
          weeks: [
            ...block.weeks.toSpliced(block.curWeekIdx, 1, {
              ...block.weeks[block.curWeekIdx],
            }),
            createNextWeek(block),
          ],
          curDayIdx: 0,
          curWeekIdx: block.curWeekIdx + 1,
        }
      : {
          ...block,
          curDayIdx: block.curDayIdx + (curDay.completedDate ? 1 : 0),
        };

    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $set: blockToSet },
      { new: true }
    );

    if (newBlock && isCurBlockDone)
      await UserModel.findOneAndUpdate(
        { _id: uid },
        { $unset: { curBlock: "" } },
        { new: true }
      );

    return NextResponse.json(newBlock);
  }
};
