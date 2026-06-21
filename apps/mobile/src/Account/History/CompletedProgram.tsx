import { Program } from "@liftledger/shared";
import dayjs from "dayjs";
import { View } from "react-native";
import { SPACING, RADIUS, FONT } from "../../theme";
import { IconButton, Text, useTheme } from "../../paper";
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
    const finalWeek = program.weeks[program.weeks.length - 1];
    const finalDay = finalWeek[finalWeek.length - 1];
    return finalDay.completedDate;
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
        backgroundColor: colors.container,
      }}
    >
      <Text
        style={{ flex: 1, fontSize: FONT.sm, color: colors.text }}
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
        containerColor={disabled ? colors.primaryDisabled : colors.primary}
        iconColor={disabled ? colors.textDisabled : "white"}
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
