import { useBlock, useMe } from "@liftledger/api-client";
import { COLORS, Day, Exercise, Set } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabNav } from "../navigation/types";
import { FONT, RADIUS, SPACING } from "../theme";

export const DashboardScreen = () => {
  const navigation = useNavigation<TabNav<"Dashboard">>();
  const { data: curUser } = useMe();
  const { data: curBlock, isLoading: curBlockLoading } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );

  const getExerciseCompleted = (exercise: Exercise) =>
    exercise.sets.reduce(
      (accSet: boolean, curSet: Set) => accSet && curSet.completed,
      true,
    );

  // Sum of completed reps×weight across the block, normalized to lbs.
  const getTotalWeight = (type: "lbs" | "kgs") =>
    `${curBlock?.weeks.reduce((accWeek: number, curWeek: Day[]) => {
      return (
        accWeek +
        curWeek.reduce((accDay: number, curDay: Day) => {
          return (
            accDay +
            curDay.exercises.reduce((accEx: number, curEx: Exercise) => {
              return (
                accEx +
                curEx.sets.reduce(
                  (accWeight: number, curSet: Set) =>
                    accWeight +
                    (curSet.completed
                      ? curSet.reps *
                        curSet.weight *
                        (curEx.weightType === type
                          ? 1
                          : curEx.weightType === "kgs"
                            ? 2.205
                            : 0.454)
                      : 0),
                  0,
                )
              );
            }, 0)
          );
        }, 0)
      );
    }, 0)} lbs`;

  const getDaysSinceLast = () => {
    if (!curBlock?.weeks[0][0].completedDate) return 0;

    let lastWorkoutDate = new Date(0);
    curBlock?.weeks.forEach((week) =>
      week.forEach((day) =>
        day.exercises.forEach((exercise) => {
          const completionDate = day.completedDate
            ? new Date(day.completedDate)
            : new Date();
          if (
            getExerciseCompleted(exercise) &&
            lastWorkoutDate < completionDate
          ) {
            lastWorkoutDate = completionDate;
          }
        }),
      ),
    );
    const timeDifference =
      new Date().getTime() - new Date(lastWorkoutDate).getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  };

  const curDayName = curBlock
    ? curBlock.weeks[curBlock.curWeekIdx].find((day) => !day.completedDate)
        ?.name || "Unavailable"
    : "Unavailable";

  const metricValueMap = [
    {
      metric: "Start Date",
      value: dayjs(curBlock?.startDate).format("MM/DD/YYYY"),
    },
    {
      metric: "Block Length:",
      value: `${curBlock?.length} week${(curBlock?.length || 0) > 1 ? "s" : ""}`,
    },
    { metric: "Week:", value: `Week ${(curBlock?.curWeekIdx || 0) + 1}` },
    { metric: "Day:", value: curDayName },
    { metric: "Days Since Last Workout:", value: getDaysSinceLast() },
    { metric: "Total Weight Lifted:", value: getTotalWeight("lbs") },
  ];

  if (!curUser || curBlockLoading) return <LogoSpinner />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerBlock}>
        {curUser && !curBlock ? (
          <Text style={styles.subhead}>
            Create a training block to get started!
          </Text>
        ) : (
          <>
            <Text style={styles.subhead}>Currently Completing:</Text>
            <Text style={styles.blockName}>{curBlock?.name}</Text>
          </>
        )}
      </View>

      {curBlock && (
        <>
          {metricValueMap.map((pair, idx) => (
            <View key={idx} style={styles.metricRow}>
              <Text style={styles.metricLabel}>{pair.metric}</Text>
              <Text style={styles.metricValue}>{pair.value}</Text>
            </View>
          ))}
          <Pressable
            style={styles.liftButton}
            onPress={() => navigation.navigate("CompleteDay")}
          >
            <Text style={styles.liftText}>Lift!</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerBlock: { alignItems: "center", marginBottom: SPACING.sm },
  subhead: {
    color: "white",
    fontSize: FONT.base,
    fontWeight: "900",
    marginBottom: SPACING.xs,
  },
  blockName: { color: "white", fontSize: 24, fontWeight: "900" },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SPACING.sm,
  },
  metricLabel: { color: "white", fontSize: FONT.base, fontWeight: "700" },
  metricValue: { color: "white", fontSize: FONT.base, textAlign: "right" },
  liftButton: {
    width: "100%",
    height: 60,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
    // Raised look matching web's layered "Lift!" button.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  liftText: { color: "white", fontSize: FONT.lg, fontWeight: "600" },
});
