import { Program } from "@liftledger/shared";

export const EMPTY_PROGRAM: Program = {
  name: "",
  startDate: new Date(),
  length: 0,
  weeks: [
    [
      {
        name: "Day 1",
        exercises: [
          {
            name: "",
            apparatus: "",
            sets: [
              {
                reps: null,
                weight: null,
                completed: false,
                note: "",
              },
            ],
            weightType: "",
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curDayIdx: 0,
  curWeekIdx: 0,
};
