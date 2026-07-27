import { useNavigation, useNavigationState } from "@react-navigation/native";
import { type NativeStackNavigationProp } from "@react-navigation/native-stack";
import { IconButton, useTheme } from "react-native-paper";
import type { RootStackParamList } from "../types";

type NavState = {
  index?: number;
  routes: { name: string; state?: NavState }[];
};

const getCurrentProgressView = (root: NavState): string => {
  const tabs = root.routes.find((r) => r.name === "Tabs")?.state;
  const progress = tabs?.routes.find((r) => r.name === "Progress")?.state;

  if (!progress) return "Chart";

  return progress.routes[progress.index ?? 0]?.name ?? "Chart";
};

export const ProgressViewToggle = () => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onChart = useNavigationState(
    (state) => getCurrentProgressView(state as unknown as NavState) === "Chart",
  );

  return (
    <IconButton
      icon={onChart ? "format-list-bulleted" : "chart-line"}
      iconColor={colors.onPrimaryContainer}
      accessibilityLabel={onChart ? "View programs" : "View chart"}
      onPress={() =>
        navigation.navigate("Tabs", {
          screen: "Progress",
          params: { screen: onChart ? "ProgramList" : "Chart" },
        })
      }
    />
  );
};
