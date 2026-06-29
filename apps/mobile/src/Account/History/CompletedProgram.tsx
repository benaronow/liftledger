import { Program } from "@liftledger/shared";
import dayjs from "dayjs";
import { View } from "react-native";
import { SPACING, RADIUS, FONT } from "../../theme";
import { IconButton, Text, useTheme } from "react-native-paper";
import { RootStackParamList } from "../../RootNavigator/types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  program: Program;
  idx: number;
  disabled?: boolean;
}

export const CompletedProgram = ({ program, idx, disabled }: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const completedDate = () => {
    if (program.endDate) return program.endDate;
    const finalRotation = program.rotations[program.rotations.length - 1];
    const finalSession = finalRotation[finalRotation.length - 1];
    return finalSession.completedDate;
  };

  return (
    <View
      key={program._id ?? idx}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 35,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.sm,
        paddingLeft: SPACING.sm,
        overflow: "hidden",
        backgroundColor: colors.surface,
      }}
    >
      <Text
        style={{ flex: 1, fontSize: FONT.sm, color: colors.onSurface }}
        numberOfLines={1}
      >
        <Text style={{ fontWeight: "700" }}>{`${idx + 1}. ${program.name}`}</Text>
        <Text>{`  (${dayjs(program.startDate).format("M/DD/YY")} - ${
          completedDate() ? dayjs(completedDate()).format("M/DD/YY") : "N/A"
        })`}</Text>
      </Text>
      <IconButton
        mode="contained"
        icon="content-copy"
        size={20}
        containerColor={disabled ? colors.surfaceDisabled : colors.primary}
        iconColor={disabled ? colors.onSurfaceDisabled : "white"}
        style={{
          width: 35,
          height: 35,
          margin: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: RADIUS.md,
          borderBottomRightRadius: RADIUS.md,
        }}
        // Gate the press manually (rather than Paper's `disabled`) so the
        // container/icon keep the explicit disabled tint above.
        onPress={
          disabled
            ? undefined
            : () =>
                // `pop: true` returns to the existing Tabs screen instead of
                // pushing a new one on top of Account (RN7 navigate no longer
                // pops back by default), so the user lands back on the root tabs.
                navigation.navigate(
                  "Tabs",
                  {
                    screen: "Program",
                    params: { duplicateFrom: program._id },
                  },
                  { pop: true },
                )
        }
      />
    </View>
  );
};
