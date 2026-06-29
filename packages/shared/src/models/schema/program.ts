import { Schema } from "mongoose";

const programSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    length: { type: Number, required: true },
    primaryGym: { type: String },
    rotations: [
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
    curSessionIdx: { type: Number, required: true },
    curRotationIdx: { type: Number, required: true },
    endDate: { type: Date },
  },
  { collection: "Program" },
);

export default programSchema;
