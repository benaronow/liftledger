import { useProgram, useMe } from "@liftledger/api-client";
import { ScrollView, View } from "react-native";
import { Text, useTheme } from "../../paper";
import { LogoSpinner } from "../../components/LogoSpinner";
import { FONT, RADIUS, SPACING } from "../../theme";
import { CompletedProgram } from "./CompletedProgram";

export const History = () => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: curProgram, isLoading: isProgramLoading } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );
  const { colors } = useTheme();

  if (isUserLoading || isProgramLoading) return <LogoSpinner />;

  const completedPrograms =
    curUser?.programs.filter((program) => program._id !== curProgram?._id) ?? [];

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
        completedPrograms.map((program, idx) => (
          <CompletedProgram key={program._id} program={program} idx={idx} />
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
