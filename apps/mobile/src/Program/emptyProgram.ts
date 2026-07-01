import { Program } from "@liftledger/shared";

export const EMPTY_PROGRAM: Program = {
  name: "",
  startDate: new Date(),
  length: 0,
  rotations: [
    [
      {
        name: "Session 1",
        exercises: [
          {
            name: "",
            equipment: "",
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
  curSessionIdx: 0,
  curRotationIdx: 0,
  restDays: 0,
};
