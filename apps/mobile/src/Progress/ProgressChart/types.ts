import type { CompletedExercise } from "@liftledger/shared";
import type { lineDataItem } from "react-native-gifted-charts";

export type ChartPoint = lineDataItem & {
  exercise?: CompletedExercise;
  gym?: string;
  color?: string;
  rawDate?: string;
};
