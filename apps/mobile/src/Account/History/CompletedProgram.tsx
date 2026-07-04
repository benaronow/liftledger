import { Program } from "@liftledger/shared";
import dayjs from "dayjs";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Text, useTheme } from "react-native-paper";
import { SPACING, RADIUS, FONT } from "../../theme";
import { RootStackParamList } from "../../RootNavigator/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  program: Program;
  disabled?: boolean;
  expanded: boolean;
  onToggle: () => void;
}

interface ExerciseBest {
  name: string;
  unit: string;
  weight: number | null;
  reps: number | null;
}

interface DaySummary {
  name: string;
  exercises: ExerciseBest[];
}

const summarizeBlock = (program: Program): DaySummary[] => {
  const dayCount = Math.max(0, ...program.rotations.map((r) => r.length));
  const days: DaySummary[] = [];

  for (let d = 0; d < dayCount; d++) {
    const sessions = program.rotations
      .map((rotation) => rotation[d])
      .filter((session) => session);
    if (sessions.length === 0) continue;

    const name = sessions[0].name?.trim() || `Day ${d + 1}`;
    // Preserve first-seen order; collapse repeats/added-ons by name.
    const order: string[] = [];
    const best = new Map<string, ExerciseBest>();

    sessions.forEach((session) =>
      session.exercises.forEach((exercise) => {
        const key = exercise.name?.trim() || "Exercise";
        exercise.workingSets.forEach((set) => {
          if (!set.completed) return;
          const prev = best.get(key);
          const weight = set.weight ?? 0;
          const prevWeight = prev?.weight ?? 0;
          if (
            !prev ||
            weight > prevWeight ||
            (weight === prevWeight && (set.reps ?? 0) > (prev.reps ?? 0))
          ) {
            if (!prev) order.push(key);
            best.set(key, {
              name: key,
              unit: exercise.unit,
              weight: set.weight,
              reps: set.reps,
            });
          }
        });
      }),
    );

    days.push({ name, exercises: order.map((key) => best.get(key)!) });
  }

  return days;
};

const formatBest = ({ weight, unit, reps }: ExerciseBest): string => {
  const load = weight != null ? `${weight}${unit}` : "BW";
  return reps != null ? `${load} × ${reps}` : load;
};

const getStartDate = (program: Program): Date | undefined => {
  const times = (program.rotations[0] ?? [])
    .map((session) => session.completedDate)
    .filter((date): date is Date => !!date)
    .map((date) => new Date(date).getTime());
  return times.length ? new Date(Math.min(...times)) : undefined;
};

export const CompletedProgram = ({
  program,
  disabled,
  expanded,
  onToggle,
}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const startDate = getStartDate(program);

  const completedDate = () => {
    if (program.endDate) return program.endDate;
    const finalRotation = program.rotations[program.rotations.length - 1];
    const finalSession = finalRotation[finalRotation.length - 1];
    return finalSession.completedDate;
  };

  const days = expanded ? summarizeBlock(program) : [];
  const completedSessions = program.rotations
    .flat()
    .filter((session) => session.completedDate).length;

  const duplicate = () =>
    navigation.navigate(
      "Tabs",
      { screen: "Program", params: { duplicateFrom: program._id } },
      { pop: true },
    );

  return (
    <View
      style={{
        width: "100%",
        marginBottom: SPACING.md,
        borderRadius: RADIUS.sm,
        overflow: "hidden",
        backgroundColor: colors.surface,
      }}
    >
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          minHeight: 35,
          paddingLeft: SPACING.sm,
          paddingRight: SPACING.xs,
          paddingVertical: SPACING.xs,
        }}
      >
        <Text
          style={{
            flex: 1,
            gap: SPACING.md,
            fontSize: FONT.sm,
            color: colors.onSurface,
          }}
          numberOfLines={1}
        >
          <Text style={{ fontWeight: "700" }}>{program.name}</Text>
          <Text>{`   ${startDate ? dayjs(startDate).format("M/DD/YY") : "N/A"} - ${
            completedDate() ? dayjs(completedDate()).format("M/DD/YY") : "N/A"
          }`}</Text>
        </Text>
        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={colors.onSurfaceVariant}
        />
      </Pressable>

      {expanded && (
        <View
          style={{
            paddingHorizontal: SPACING.md,
            paddingBottom: SPACING.md,
            gap: SPACING.md,
          }}
        >
          <Text style={{ fontSize: FONT.sm, color: colors.onSurfaceVariant }}>
            {`${program.rotations.length} rotation${
              program.rotations.length === 1 ? "" : "s"
            } · ${completedSessions} session${
              completedSessions === 1 ? "" : "s"
            } completed`}
          </Text>

          {days.map((day, dayIdx) => (
            <View key={dayIdx} style={{ gap: 2 }}>
              <Text
                style={{
                  fontSize: FONT.sm,
                  fontWeight: "700",
                  color: colors.onSurface,
                }}
              >
                {day.name}
              </Text>
              {day.exercises.length > 0 ? (
                day.exercises.map((exercise, exIdx) => (
                  <Text
                    key={exIdx}
                    style={{
                      fontSize: FONT.sm,
                      color: colors.onSurfaceVariant,
                      paddingLeft: SPACING.sm,
                    }}
                  >
                    {`${exercise.name} — ${formatBest(exercise)}`}
                  </Text>
                ))
              ) : (
                <Text
                  style={{
                    fontSize: FONT.sm,
                    fontStyle: "italic",
                    color: colors.onSurfaceDisabled,
                    paddingLeft: SPACING.sm,
                  }}
                >
                  No completed sets
                </Text>
              )}
            </View>
          ))}

          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              gap: SPACING.sm,
              width: "100%",
            }}
          >
            <Button
              mode="contained"
              icon="content-copy"
              disabled={disabled}
              onPress={duplicate}
              style={{ borderRadius: RADIUS.md, width: "100%" }}
            >
              Duplicate
            </Button>
            {disabled && (
              <Text
                style={{
                  flex: 1,
                  fontSize: FONT.xs,
                  color: colors.onSurfaceDisabled,
                }}
              >
                {"Can't duplicate while a program is in progress."}
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
