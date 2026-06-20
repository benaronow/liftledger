import { useExerciseSelection } from "@liftledger/api-client";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { TabParamList } from "../RootNavigator/types";
import { Surface, useTheme } from "../paper";
import { SPACING } from "../theme";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const Progress = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<TabParamList, "Progress">>();

  // Seed from route params when deep-linked (CompleteDay's "full progress"),
  // otherwise useExerciseSelection seeds to the first exercise with history.
  const [selectedName, setSelectedName] = useState(params?.name ?? "");
  const [selectedApparatus, setSelectedApparatus] = useState(
    params?.apparatus ?? "",
  );

  // Re-apply params when navigated here again while the tab is already mounted.
  useEffect(() => {
    if (params?.name) {
      setSelectedName(params.name);
      setSelectedApparatus(params.apparatus ?? "");
    }
  }, [params?.name, params?.apparatus]);
  const { selectName, isLoading } = useExerciseSelection({
    selectedName,
    selectedApparatus,
    setSelectedName,
    setSelectedApparatus,
  });

  if (isLoading) return <LogoSpinner />;

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: floatingTabBarClearance(insets.bottom),
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          backgroundColor: colors.dark,
          marginBottom: SPACING.lg,
        }}
      >
        <ExerciseSelector
          selectedName={selectedName}
          selectedApparatus={selectedApparatus}
          setSelectedName={selectName}
          setSelectedApparatus={setSelectedApparatus}
        />
      </View>
      <View
        style={{
          flex: 1,
          paddingHorizontal: SPACING.lg,
          marginBottom: SPACING.sm,
        }}
      >
        <Surface
          style={{
            flex: 1,
            paddingTop: SPACING.lg,
            paddingBottom: SPACING.sm,
            borderRadius: 12,
          }}
        >
          <ProgressChart
            selectedName={selectedName}
            selectedApparatus={selectedApparatus}
          />
        </Surface>
      </View>
    </View>
  );
};
