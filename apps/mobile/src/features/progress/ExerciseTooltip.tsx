import { COLORS } from "@liftledger/shared";
import dayjs from "dayjs";
import { StyleSheet, Text, View } from "react-native";
import { FONT, RADIUS, SPACING } from "../../theme";
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
    <View style={[styles.container, { width, transform: [{ translateX }] }]}>
      {date && (
        <Text style={styles.date}>{dayjs(date).format("M/D/YY")}</Text>
      )}
      {present.map((item, idx) => {
        const exercise = item.exercise!;
        return (
          <View key={item.gym ?? idx} style={styles.gymBlock}>
            <Text style={[styles.gym, { color: item.color ?? "white" }]}>
              {item.gym}
            </Text>
            {exercise.sets.map((set, setIdx) => (
              <Text key={setIdx} style={styles.set}>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  date: { color: "white", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  gymBlock: { marginBottom: 4 },
  gym: { fontSize: FONT.sm, fontWeight: "700", marginBottom: 4 },
  set: { color: "white", fontSize: FONT.xs },
});
