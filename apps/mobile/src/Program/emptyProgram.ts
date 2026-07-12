import { Program } from "@liftledger/shared";

export const emptyProgram = (unit = ""): Program => ({
  name: "",
  length: 0,
  rotations: [
    [
      {
        name: "Session 1",
        exercises: [
          {
            name: "",
            equipment: "",
            warmupSets: [],
            workingSets: [
              {
                reps: null,
                weight: null,
                completed: false,
                note: "",
              },
            ],
            unit,
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curSessionIdx: 0,
  curRotationIdx: 0,
  restDays: 0,
});
