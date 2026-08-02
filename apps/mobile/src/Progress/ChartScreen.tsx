import { useExerciseSelection } from "@liftledger/api-client";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { SectionCard } from "../components/SectionCard";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { ProgressStackParamList } from "../RootNavigator/types";
import { SPACING } from "../theme";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const ChartScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<ProgressStackParamList, "Chart">>();

  const [selectedName, setSelectedName] = useState(params?.name ?? "");
  const [selectedEquipment, setSelectedEquipment] = useState(
    params?.equipment ?? "",
  );

  useEffect(() => {
    if (params?.name) {
      setSelectedName(params.name);
      setSelectedEquipment(params.equipment ?? "");
    }
  }, [params?.name, params?.equipment]);

  const { selectName, isLoading } = useExerciseSelection({
    selectedName,
    selectedEquipment,
    setSelectedName,
    setSelectedEquipment,
  });

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
          selectedEquipment={selectedEquipment}
          setSelectedName={selectName}
          setSelectedEquipment={setSelectedEquipment}
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
            selectedEquipment={selectedEquipment}
            loading={isLoading}
          />
        </SectionCard>
      </View>
    </View>
  );
};
