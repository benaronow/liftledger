import { useProgram, useMe } from "@liftledger/api-client";
import { Day, Exercise, Set } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, TouchableRipple, useTheme } from "../paper";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { TabNav } from "../RootNavigator/types";
import { FONT, RADIUS, SPACING } from "../theme";

// Factors that convert a set's logged weight into lbs for the running total,
// keyed off the exercise's weight unit.
const KGS_TO_LBS = 2.205;
// Fallback for any non-lbs/non-kgs unit (preserves prior behavior).
const UNKNOWN_UNIT_TO_LBS = 0.454;

export const Dashboard = () => {
  const navigation = useNavigation<TabNav<"Dashboard">>();
  const { data: curUser } = useMe();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: curProgram, isLoading: curProgramLoading } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );

  const getExerciseCompleted = (exercise: Exercise) =>
    exercise.sets.reduce(
      (accSet: boolean, curSet: Set) => accSet && curSet.completed,
      true,
    );

  // Sum of completed reps×weight across the program, normalized to lbs.
  const getTotalWeight = () =>
    `${curProgram?.weeks.reduce((accWeek: number, curWeek: Day[]) => {
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
                        (curEx.weightType === "lbs"
                          ? 1
                          : curEx.weightType === "kgs"
                            ? KGS_TO_LBS
                            : UNKNOWN_UNIT_TO_LBS)
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
    if (!curProgram?.weeks[0][0].completedDate) return 0;

    let lastWorkoutDate = new Date(0);
    curProgram?.weeks.forEach((week) =>
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

  const curDayName = curProgram
    ? curProgram.weeks[curProgram.curWeekIdx].find((day) => !day.completedDate)
        ?.name || "Unavailable"
    : "Unavailable";

  const metricValueMap = [
    {
      metric: "Start Date",
      value: dayjs(curProgram?.startDate).format("MM/DD/YYYY"),
    },
    {
      metric: "Program Length",
      value: `${curProgram?.length} week${(curProgram?.length || 0) > 1 ? "s" : ""}`,
    },
    { metric: "Week", value: `Week ${(curProgram?.curWeekIdx || 0) + 1}` },
    { metric: "Day", value: curDayName },
    { metric: "Days Since Last Workout", value: getDaysSinceLast() },
    { metric: "Total Weight Lifted", value: getTotalWeight() },
  ];

  if (!curUser || curProgramLoading) return <LogoSpinner />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "space-evenly",
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingBottom: floatingTabBarClearance(insets.bottom),
      }}
    >
      <View style={{ alignItems: "center", marginBottom: SPACING.sm }}>
        {curUser && !curProgram ? (
          <Text
            style={{
              fontSize: FONT.base,
              fontWeight: "900",
              marginBottom: SPACING.xs,
              color: colors.text,
            }}
          >
            Create a training program to get started!
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: FONT.base,
                fontWeight: "900",
                marginBottom: SPACING.xs,
                color: colors.text,
              }}
            >
              Currently Completing:
            </Text>
            <Text
              style={{ fontSize: 24, fontWeight: "900", color: colors.text }}
            >
              {curProgram?.name}
            </Text>
          </>
        )}
      </View>

      {curProgram && (
        <>
          {metricValueMap.map((pair, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                marginBottom: SPACING.sm,
              }}
            >
              <Text
                style={{
                  fontSize: FONT.base,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                {pair.metric}
              </Text>
              <Text
                style={{
                  fontSize: FONT.base,
                  textAlign: "right",
                  color: colors.text,
                }}
              >
                {pair.value}
              </Text>
            </View>
          ))}
          <TouchableRipple
            style={{
              width: "100%",
              height: 60,
              borderRadius: RADIUS.xl,
              alignItems: "center",
              justifyContent: "center",
              marginTop: SPACING.md,
              // Intentionally bespoke: the signature "Lift!" CTA keeps web's
              // layered/raised look rather than using Paper's <Button> or
              // ActionButton.
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4,
              backgroundColor: colors.primary,
            }}
            onPress={() => navigation.navigate("CompleteDay")}
          >
            <Text
              style={{ color: "white", fontSize: FONT.lg, fontWeight: "600" }}
            >
              Lift!
            </Text>
          </TouchableRipple>
        </>
      )}
    </ScrollView>
  );
};
