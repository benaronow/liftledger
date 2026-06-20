import dayjs from "dayjs";
import { View } from "react-native";
import { Text, useTheme } from "../../paper";
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
        backgroundColor: scheme === "dark" ? colors.dark : colors.background,
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
            color: colors.text,
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
                color: item.color ?? colors.text,
              }}
            >
              {item.gym}
            </Text>
            {exercise.sets.map((set, setIdx) => (
              <Text
                key={setIdx}
                style={{ color: colors.text, fontSize: FONT.xs }}
              >
                Set {setIdx + 1}: {set.weight} {exercise.weightType} ×{" "}
                {set.reps} reps
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
};
