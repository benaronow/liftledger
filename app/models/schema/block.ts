import { Schema } from "mongoose";

const blockSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    length: {
      type: String,
      required: true,
    },
    weeks: [
      {
        number: Number,
        days: [
          {
            name: String,
            exercises: [
              {
                name: String,
                apparatus: String,
                musclesWorked: [String],
                sets: Number,
                reps: [Number],
                weight: [Number],
                weightType: String,
                unilateral: Boolean,
                prevSessionNote: String,
              },
            ]
          },
        ],
      },
    ],
  },
  { collection: "Block" }
);

export default blockSchema;
