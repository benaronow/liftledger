import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { Block, BlockOp, Day, Set, Week } from "@/types";
import { NextRequest, NextResponse } from "next/server";

const latestSession = (curWeek: Week, curDay: number) => {
  const curDayDetail = curWeek.days[curDay];
  let latest = 0;

  for (let i = curDay + 1; i < curWeek.days.length; i++) {
    const laterSessionDetail = curWeek.days[i];
    if (
      curDayDetail.hasGroup &&
      laterSessionDetail.hasGroup &&
      curDayDetail.groupName === laterSessionDetail.groupName
    )
      latest = i;
  }

  return latest;
};

const getNextWeek = (thisWeek: Week): Week => ({
  number: thisWeek.number + 1,
  days: thisWeek.days.map((day, dIdx) => {
    const latestSessionIdx = latestSession(thisWeek, dIdx);
    return {
      name: day.name,
      hasGroup: day.hasGroup,
      groupName: day.groupName,
      exercises: day.exercises.map((exercise, eIdx) => {
        return {
          name: exercise.name,
          apparatus: exercise.apparatus,
          sets: thisWeek.days[latestSessionIdx || dIdx].exercises[
            eIdx
          ].sets.map((set: Set) => ({
            ...set,
            completed: false,
            note: "",
          })),
          weightType: exercise.weightType,
          unilateral: exercise.unilateral,
        };
      }),
      completed: false,
      completedDate: undefined,
    } as Day;
  }),
  completed: false,
});

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
    const finishedDay =
      block.weeks[block.curWeekIdx].days[block.curDayIdx].completed;

    const finishedWeek =
      block.weeks[block.curWeekIdx].days.length - 1 === block.curDayIdx &&
      finishedDay;

    const finishedBlock = block.curWeekIdx >= block.length - 1 && finishedWeek;

    const blockToSet = finishedBlock
      ? {
          ...block,
          weeks: [
            ...block.weeks.toSpliced(block.curWeekIdx, 1, {
              ...block.weeks[block.curWeekIdx],
              completed: true,
            }),
          ],
          completed: true,
        }
      : finishedWeek
      ? {
          ...block,
          weeks: [
            ...block.weeks.toSpliced(block.curWeekIdx, 1, {
              ...block.weeks[block.curWeekIdx],
              completed: true,
            }),
            getNextWeek(block.weeks[block.curWeekIdx]),
          ],
          curDayIdx: 0,
          curWeekIdx: block.curWeekIdx + 1,
        }
      : { ...block, curDayIdx: block.curDayIdx + (finishedDay ? 1 : 0) };

    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $set: blockToSet },
      { new: true }
    );

    if (newBlock && blockToSet.completed)
      await UserModel.findOneAndUpdate(
        { _id: uid },
        { $unset: { curBlock: "" } },
        { new: true }
      );

    return NextResponse.json(newBlock);
  }
};
