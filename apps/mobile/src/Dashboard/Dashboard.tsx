import { useProgram, useMe, useCurrentDay } from "@liftledger/api-client";
import { Day, Exercise, Set } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, TouchableRipple, useTheme } from "../paper";
import { LogoSpinner } from "../components/LogoSpinner";
import { SectionCard } from "../components/SectionCard";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { TabNav } from "../RootNavigator/types";
import { FONT, RADIUS, SPACING } from "../theme";

const KGS_TO_LBS = 2.205;
const LBS_TO_KGS = 0.454;

export const Dashboard = () => {
  const navigation = useNavigation<TabNav<"Dashboard">>();
  const { data: curUser } = useMe();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: curProgram, isLoading: curProgramLoading } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );
  const { isDayStarted } = useCurrentDay();

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
                      ? (curSet.reps ?? 0) *
                        (curSet.weight ?? 0) *
                        (curEx.weightType === "lbs"
                          ? 1
                          : curEx.weightType === "kgs"
                            ? KGS_TO_LBS
                            : LBS_TO_KGS)
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

  if (!curUser || curProgramLoading || (curUser.curProgram && !curProgram))
    return <LogoSpinner />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
        paddingBottom: floatingTabBarClearance(insets.bottom),
      }}
    >
      <View style={{ alignItems: "center" }}>
        {curUser && !curProgram ? (
          <Text
            style={{
              fontSize: FONT.base,
              fontWeight: "900",
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
          <SectionCard style={{ gap: SPACING.xl }}>
            {metricValueMap.map((pair, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
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
          </SectionCard>
          <TouchableRipple
            style={{
              width: "100%",
              height: 60,
              borderRadius: RADIUS.xl,
              alignItems: "center",
              justifyContent: "center",
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
              {isDayStarted ? "Resume Workout" : "Start Workout"}
            </Text>
          </TouchableRipple>
        </>
      )}
    </ScrollView>
  );
};
