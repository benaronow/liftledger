import { connectDB } from "@/app/connectDB";
import BlockModel from "@/app/models/block";
import UserModel from "@/app/models/user";
import { Block, BlockOp, Week } from "@/types";
import { NextRequest, NextResponse } from "next/server";

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
    const newBlock = await BlockModel.findOneAndUpdate(
      { _id: block._id },
      { $set: { weeks: block.weeks, completed: block.completed } },
      { new: true }
    );
    const thisWeek = newBlock?.weeks[newBlock.weeks.length - 1];
    if (thisWeek && thisWeek.completed && !newBlock.completed) {
      const nextWeek: Week = {
        number: thisWeek.number + 1,
        days: thisWeek.days.map((day) => {
          return {
            name: day.name,
            exercises: day.exercises.map((exercise) => {
              return {
                name: exercise.name,
                apparatus: exercise.apparatus,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
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
        { _id: newBlock._id },
        { $addToSet: { weeks: nextWeek } },
        { new: true }
      );
      return NextResponse.json(newBlockWithNextWeek);
    }
    if (block.completed)
      await UserModel.findOneAndUpdate(
        { _id: uid },
        { $unset: { curBlock: "" } },
        { new: true }
      );
    return NextResponse.json(newBlock);
  }
};
