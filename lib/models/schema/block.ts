import { Schema } from "mongoose";

const blockSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    length: { type: Number, required: true },
    primaryGym: { type: String },
    weeks: [
      [
        {
          name: String,
          gym: String,
          exercises: [
            {
              name: String,
              apparatus: String,
              gym: String,
              sets: [
                {
                  reps: Number,
                  weight: Number,
                  note: String,
                  completed: Boolean,
                  skipped: Boolean,
                  addedOn: Boolean,
                },
              ],
              weightType: String,
              addedOn: Boolean,
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
