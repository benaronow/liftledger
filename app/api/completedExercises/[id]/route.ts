import { connectDB } from "@/lib/connectDB";
import BlockModel from "@/lib/models/block";
import UserModel from "@/lib/models/user";
import { Block, Exercise, ExerciseWithDate, GetParams } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: GetParams) => {
  await connectDB();

  const user = await UserModel.findOne({ _id: (await params).id })
    .populate([{ path: "blocks", model: BlockModel }])
    .lean();

  const blocks: Block[] = user?.blocks || [];

  const curBlock = blocks.find(
    (block) => String(block._id) === String(user?.curBlock),
  );

  const previousCompletedExercises: ExerciseWithDate[] = blocks
    .flatMap((block) => {
      if (block._id === curBlock?._id) {
        return block.weeks
          .filter((_, wIdx) => wIdx <= block.curWeekIdx)
          .flatMap((week, wIdx) =>
            week
              .filter((_, dIdx) =>
                wIdx === block.curWeekIdx ? dIdx < block.curDayIdx : true,
              )
              .flatMap((day) =>
                day.exercises.map((exercise) => ({
                  ...exercise,
                  completedDate: day.completedDate!,
                })),
              ),
          );
      }

      return block.weeks.flatMap((week) =>
        week.flatMap((day) =>
          day.exercises.map((exercise) => ({
            ...exercise,
            completedDate: day.completedDate,
          })),
        ),
      );
    })
    .reverse();

  const currentCompletedExercises: Exercise[] = curBlock
    ? curBlock?.weeks[curBlock.curWeekIdx][
        curBlock.curDayIdx
      ].exercises.reverse()
    : [];

  const completedExercises = {
    current: currentCompletedExercises,
    previous: previousCompletedExercises,
  };

  return NextResponse.json(completedExercises);
};
