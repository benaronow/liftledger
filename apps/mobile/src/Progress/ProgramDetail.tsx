import { useMe } from "@liftledger/api-client";
import { RouteProp, useRoute } from "@react-navigation/native";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { LogoSpinner } from "../components/LogoSpinner";
import type { ProgressStackParamList } from "../RootNavigator/types";
import { FONT, SPACING } from "../theme";
import { ProgramView } from "./ProgramView";
import { ProgressActions } from "./ProgressTopBar";
import { ProgressTitle } from "./ProgressTitle";

export const ProgramDetail = () => {
  const { colors } = useTheme();
  const { params } =
    useRoute<RouteProp<ProgressStackParamList, "ProgramDetail">>();
  const { data: me, isLoading } = useMe();

  const program = me?.programs.find((p) => p._id === params.programId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? (
        <>
          <ProgressTitle title="Program" reserveButtons={1} />
          <LogoSpinner />
          <ProgressActions showBack />
        </>
      ) : program ? (
        <ProgramView serverProgram={program} title={program.name} showBack />
      ) : (
        <>
          <ProgressTitle title="Program" reserveButtons={1} />
          <View style={{ flex: 1, alignItems: "center", padding: SPACING.xl }}>
            <Text
              style={{
                fontSize: FONT.base,
                fontWeight: "700",
                color: colors.onSurface,
              }}
            >
              Program not found
            </Text>
          </View>
          <ProgressActions showBack />
        </>
      )}
    </View>
  );
};
