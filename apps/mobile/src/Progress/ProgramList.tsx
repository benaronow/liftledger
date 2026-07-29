import { useMe, useProgramSummaries } from "@liftledger/api-client";
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

const time = (date?: Date): number => (date ? new Date(date).getTime() : 0);

const fmt = (date?: Date) => (date ? dayjs(date).format("M/DD/YY") : "N/A");

export const ProgramList = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ProgressStackNav<"ProgramList">>();
  const { data: me } = useMe();
  const { data: summaries, isLoading } = useProgramSummaries();

  const programs = useMemo(
    () =>
      (summaries ?? [])
        .slice()
        .sort((a, b) => time(b.endDate) - time(a.endDate)),
    [summaries],
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
                        : `${fmt(program.startDate)} - ${fmt(program.endDate)}`}
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
