import { useProgram, useMe } from "@liftledger/api-client";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../paper";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import { SPACING } from "../theme";
import { NoProgramPlaceholder } from "./NoProgramPlaceholder";
import { ProgramOverview } from "./ProgramOverview";

export const Dashboard = () => {
  const { data: curUser } = useMe();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: curProgram, isLoading: curProgramLoading } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );

  if (!curUser || curProgramLoading || (curUser.curProgram && !curProgram))
    return <LogoSpinner />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        paddingBottom: floatingTabBarClearance(insets.bottom),
      }}
    >
      {curProgram ? (
        <ProgramOverview program={curProgram} />
      ) : (
        <NoProgramPlaceholder />
      )}
    </View>
  );
};
