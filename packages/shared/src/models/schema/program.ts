import { Schema } from "mongoose";

const setFields = {
  reps: Number,
  weight: Number,
  note: String,
  completed: Boolean,
  skipped: Boolean,
  addedOn: Boolean,
};

const programSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
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
              equipment: String,
              gym: String,
              warmupSets: [setFields],
              workingSets: [
                {
                  ...setFields,
                  dropSets: [setFields],
                },
              ],
              unit: String,
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
    restDays: { type: Number, default: 0 },
  },
  { collection: "Program" },
);

export default programSchema;
