import { Schema } from "mongoose";

const blockSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    length: { type: Number, required: true },
    weeks: [
      {
        number: Number,
        days: [
          {
            name: String,
            hasGroup: Boolean,
            groupName: String,
            exercises: [
              {
                name: String,
                apparatus: String,
                musclesWorked: [String],
                sets: [
                  {
                    reps: Number,
                    weight: Number,
                    note: String,
                    completed: Boolean,
                  },
                ],
                weightType: String,
                unilateral: Boolean,
              },
            ],
            completed: Boolean,
            completedDate: Date,
          },
        ],
        completed: Boolean,
      },
    ],
    completed: { type: Boolean, required: true },
    curDayIdx: { type: Number, required: true },
    curWeekIdx: { type: Number, required: true },
  },
  { collection: "Block" }
);

export default blockSchema;
