import { useMe, useProgramSummaries } from "@liftledger/api-client";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { LogoSpinner } from "../../components/LogoSpinner";
import { FONT, RADIUS, SPACING } from "../../theme";
import { CompletedProgram } from "./CompletedProgram";

export const History = () => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: summaries, isLoading: isSummariesLoading } =
    useProgramSummaries();
  const { colors } = useTheme();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (isUserLoading || isSummariesLoading) return <LogoSpinner />;

  const hasActiveProgram = !!curUser?.curProgram;

  const completedPrograms =
    summaries?.filter((program) => program._id !== curUser?.curProgram) ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
      }}
    >
      {completedPrograms.length > 0 ? (
        completedPrograms.map((summary, idx) => (
          <CompletedProgram
            key={summary._id}
            summary={summary}
            disabled={hasActiveProgram}
            expanded={openIdx === idx}
            onToggle={() => setOpenIdx((prev) => (prev === idx ? null : idx))}
          />
        ))
      ) : (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            borderRadius: RADIUS.sm,
            padding: SPACING.md,
          }}
        >
          <Text style={{ fontSize: FONT.base, fontWeight: "700" }}>
            No completed programs yet
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
