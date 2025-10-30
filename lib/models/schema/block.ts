import { Schema } from "mongoose";

const blockSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    length: { type: Number, required: true },
    initialWeek: [
      {
        name: String,
        exercises: [
          {
            name: String,
            apparatus: String,
            sets: [
              {
                reps: Number,
                weight: Number,
                note: String,
                completed: Boolean,
              },
            ],
            weightType: String,
          },
        ],
        completedDate: Date,
      },
    ],
    weeks: [
      [
        {
          name: String,
          exercises: [
            {
              name: String,
              apparatus: String,
              sets: [
                {
                  reps: Number,
                  weight: Number,
                  note: String,
                  completed: Boolean,
                  skipped: Boolean,
                  addOn: Boolean,
                },
              ],
              weightType: String,
              addOn: Boolean,
            },
          ],
          completedDate: Date,
        },
      ],
    ],
    curDayIdx: { type: Number, required: true },
    curWeekIdx: { type: Number, required: true },
  },
  { collection: "Block" }
);

export default blockSchema;
