import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Program } from "@liftledger/shared";
import dayjs from "dayjs";
import { View } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { SPACING, RADIUS, FONT } from "../../theme";
import { Text, useTheme } from "../../paper";
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
      <ActionButton
        roundedSide="end"
        height={35}
        width={35}
        disabled={disabled}
        icon={
          <MaterialCommunityIcons
            name="content-copy"
            size={20}
            color={disabled ? colors.textDisabled : "white"}
          />
        }
        onPress={() =>
          // `pop: true` returns to the existing Tabs screen instead of pushing
          // a new one on top of Account (RN7 navigate no longer pops back by
          // default), so the user lands back on the root tab navigation.
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
