import { View } from "react-native";
import { Text, useTheme } from "../../paper";
import { FONT, SPACING } from "../../theme";
import { Program } from "@liftledger/shared";
import { MetricQuadrants } from "./MetricQuadrants";

type Props = {
  program: Program;
};

export const ProgramOverview = ({ program }: Props) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignSelf: "stretch",
        alignItems: "center",
        gap: SPACING.xl,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xl,
      }}
    >
      <View style={{ alignItems: "center" }}>
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
        <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text }}>
          {program.name}
        </Text>
      </View>
      <MetricQuadrants program={program} />
    </View>
  );
};
