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
}

export const CompletedProgram = ({ program, idx }: Props) => {
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
        backgroundColor: colors.dark,
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
        icon={
          <MaterialCommunityIcons name="content-copy" size={20} color="white" />
        }
        onPress={() =>
          navigation.navigate("Tabs", {
            screen: "EditProgram",
            params: { duplicateFrom: program._id },
          })
        }
      />
    </View>
  );
};
