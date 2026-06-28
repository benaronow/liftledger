import dayjs from "dayjs";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../theme";
import type { ChartPoint } from "./types";
import { useThemePreference } from "../../providers/ThemeProvider";

export const ExerciseTooltip = ({
  items,
  width,
  translateX,
}: {
  items: ChartPoint[];
  width: number;
  translateX: number;
}) => {
  const { colors } = useTheme();
  const { scheme } = useThemePreference();
  const present = items.filter((item) => item.exercise);
  if (present.length === 0) return null;

  const date = present[0].rawDate;

  return (
    <View
      style={{
        backgroundColor: scheme === "dark" ? colors.surfaceVariant : colors.background,
        borderRadius: RADIUS.sm,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        width,
        transform: [{ translateX }],
      }}
    >
      {date && (
        <Text
          style={{
            color: colors.onSurface,
            fontSize: 13,
            fontWeight: "700",
            marginBottom: 4,
          }}
        >
          {dayjs(date).format("M/D/YY")}
        </Text>
      )}
      {present.map((item, idx) => {
        const exercise = item.exercise!;
        return (
          <View key={item.gym ?? idx} style={{ marginBottom: 4 }}>
            <Text
              style={{
                fontSize: FONT.sm,
                fontWeight: "700",
                marginBottom: 4,
                color: item.color ?? colors.onSurface,
              }}
            >
              {item.gym}
            </Text>
            {exercise.sets.map((set, setIdx) => (
              <Text
                key={setIdx}
                style={{ color: colors.onSurface, fontSize: FONT.xs }}
              >
                Set {setIdx + 1}: {set.weight ?? 0} {exercise.weightType} ×{" "}
                {set.reps ?? 0} reps
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};
