import { useMe } from "@liftledger/api-client";
import { Program } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { ProgressStackNav } from "../RootNavigator/types";
import { FONT, RADIUS, SPACING } from "../theme";
import { ProgressTitle } from "./ProgressTitle";

const completedDates = (program: Program): number[] =>
  program.rotations
    .flat()
    .map((session) => session.completedDate)
    .filter((date): date is Date => !!date)
    .map((date) => new Date(date).getTime());

const startTime = (program: Program): number | undefined => {
  const times = completedDates(program);
  return times.length ? Math.min(...times) : undefined;
};

const endTime = (program: Program): number | undefined => {
  if (program.endDate) return new Date(program.endDate).getTime();
  const times = completedDates(program);
  return times.length ? Math.max(...times) : undefined;
};

const fmt = (time?: number) => (time ? dayjs(time).format("M/DD/YY") : "N/A");

export const ProgramList = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProgressStackNav<"ProgramList">>();
  const { data: me, isLoading } = useMe();

  const programs = useMemo(
    () =>
      (me?.programs ?? [])
        .slice()
        .sort((a, b) => (endTime(b) ?? 0) - (endTime(a) ?? 0)),
    [me?.programs],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? (
        <>
          <ProgressTitle title="All Programs" />
          <LogoSpinner />
        </>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: floatingTabBarClearance(insets.bottom + SPACING.xxl),
          }}
        >
          <ProgressTitle title="All Programs" />
          <View
            style={{
              paddingHorizontal: SPACING.lg,
              paddingTop: SPACING.md,
              gap: SPACING.sm,
            }}
          >
            {programs.length > 0 ? (
              programs.map((program) => (
                <Pressable
                  key={program._id}
                  onPress={() =>
                    navigation.navigate("ProgramDetail", {
                      programId: program._id!,
                    })
                  }
                  accessibilityRole="button"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: SPACING.sm,
                    minHeight: 48,
                    paddingHorizontal: SPACING.md,
                    borderRadius: RADIUS.sm,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: FONT.base,
                        fontWeight: "800",
                        color: colors.onSurface,
                      }}
                    >
                      {program.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: FONT.xs,
                        color: colors.onSurfaceVariant,
                      }}
                    >
                      {program._id === me?.curProgram
                        ? "Current"
                        : `${fmt(startTime(program))} - ${fmt(endTime(program))}`}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              ))
            ) : (
              <View style={{ alignItems: "center", padding: SPACING.xl }}>
                <Text
                  style={{
                    fontSize: FONT.base,
                    fontWeight: "700",
                    color: colors.onSurface,
                  }}
                >
                  No past programs yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
