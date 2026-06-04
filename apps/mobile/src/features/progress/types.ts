import type { CompletedExercise } from "@liftledger/shared";
import type { lineDataItem } from "react-native-gifted-charts";

// A chart point carries the gifted-charts fields plus the source exercise so the
// pointer tooltip can render its sets without a separate lookup. Filled gap
// points leave `exercise` undefined so the tooltip skips them.
export type ChartPoint = lineDataItem & {
  exercise?: CompletedExercise;
  gym?: string;
  color?: string;
  rawDate?: string;
};
