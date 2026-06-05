import { DARK_COLORS } from "@liftledger/shared";
import dayjs from "dayjs";
import { Text, View } from "react-native";
import { FONT, RADIUS, SPACING } from "../theme";
import type { ChartPoint } from "./types";

// Rendered by the chart's pointer: one focused point per gym line at the touched
// date. Mirrors web's tooltip — date header, then each gym's sets.
export const ExerciseTooltip = ({
  items,
  width,
  translateX,
}: {
  items: ChartPoint[];
  width: number;
  // Horizontal correction applied by the chart to center the box over the point
  // and clamp it within the plot.
  translateX: number;
}) => {
  const present = items.filter((item) => item.exercise);
  if (present.length === 0) return null;

  const date = present[0].rawDate;

  return (
    <View
      style={{
        backgroundColor: DARK_COLORS.dark,
        borderRadius: RADIUS.sm,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        width,
        transform: [{ translateX }],
      }}
    >
      {date && (
        <Text style={{ color: "white", fontSize: 13, fontWeight: "700", marginBottom: 4 }}>
          {dayjs(date).format("M/D/YY")}
        </Text>
      )}
      {present.map((item, idx) => {
        const exercise = item.exercise!;
        return (
          <View key={item.gym ?? idx} style={{ marginBottom: 4 }}>
            <Text style={{ fontSize: FONT.sm, fontWeight: "700", marginBottom: 4, color: item.color ?? "white" }}>
              {item.gym}
            </Text>
            {exercise.sets.map((set, setIdx) => (
              <Text key={setIdx} style={{ color: "white", fontSize: FONT.xs }}>
                Set {setIdx + 1}: {set.weight} {exercise.weightType} × {set.reps}{" "}
                reps
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};
