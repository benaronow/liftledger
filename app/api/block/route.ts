import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { Block, BlockOp, Week } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  await connectDB();

  const {
    uid,
    block,
    curWeek,
    type,
  }: { uid: string; block: Block; curWeek: number; type: BlockOp } =
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

  if (type === BlockOp.Edit) {
    const thisWeek = block.weeks[curWeek];
    if (thisWeek && thisWeek.completed && !block.completed) {
      const nextWeek: Week = {
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
                sets: thisWeek.days[latestSessionIdx || dIdx].exercises[eIdx]
                  .sets,
                reps: thisWeek.days[latestSessionIdx || dIdx].exercises[eIdx]
                  .reps,
                weight:
                  thisWeek.days[latestSessionIdx || dIdx].exercises[eIdx]
                    .weight,
                weightType: exercise.weightType,
                unilateral: exercise.unilateral,
                note: "",
                completed: false,
              };
            }),
            completed: false,
            completedDate: undefined,
          };
        }),
        completed: false,
      };
      const newBlockWithNextWeek = await BlockModel.findOneAndUpdate(
        { _id: block._id },
        {
          $set: { weeks: block.weeks.toSpliced(curWeek + 1, 1, nextWeek) },
        },
        { new: true }
      );
      return NextResponse.json(newBlockWithNextWeek);
    }
    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $set: { weeks: block.weeks, completed: block.completed } },
      { new: true }
    );
    if (block.completed)
      await UserModel.findOneAndUpdate(
        { _id: uid },
        { $unset: { curBlock: "" } },
        { new: true }
      );
    return NextResponse.json(newBlock);
  }
};
