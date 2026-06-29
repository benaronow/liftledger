import { useExerciseSelection } from "@liftledger/api-client";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { TabParamList } from "../RootNavigator/types";
import { useTheme } from "react-native-paper";
import { SPACING } from "../theme";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";
import { SectionCard } from "../components/SectionCard";

export const Progress = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<TabParamList, "Progress">>();

  const [selectedName, setSelectedName] = useState(params?.name ?? "");
  const [selectedApparatus, setSelectedApparatus] = useState(
    params?.apparatus ?? "",
  );

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
        paddingBottom: floatingTabBarClearance(insets.bottom + SPACING.xl),
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          backgroundColor: colors.primaryContainer,
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
        }}
      >
        <SectionCard title="All Progress" style={{ flex: 1 }}>
          <ProgressChart
            selectedName={selectedName}
            selectedApparatus={selectedApparatus}
          />
        </SectionCard>
      </View>
    </View>
  );
};
