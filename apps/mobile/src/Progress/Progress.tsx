import { useExerciseSelection } from "@liftledger/api-client";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import { Surface, useTheme } from "../paper";
import { SPACING } from "../theme";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const Progress = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedName, setSelectedName] = useState("");
  const [selectedApparatus, setSelectedApparatus] = useState("");
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
