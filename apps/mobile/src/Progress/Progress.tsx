import {
  useCompletedExercises,
  useExerciseOptions,
  useMe,
} from "@liftledger/api-client";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import { Surface, useTheme } from "../paper";
import { SPACING } from "../theme";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";

export const Progress = () => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();

  // Selection lives here (web stored it in the URL; there's no URL on mobile),
  // and flows down to the selector and chart.
  const [selectedName, setSelectedName] = useState("");
  const [selectedApparatus, setSelectedApparatus] = useState("");

  // Seed the name: first completed exercise, else the first option.
  useEffect(() => {
    if (selectedName) return;
    const firstCompleted = completedExercises?.previous[0]?.name;
    if (firstCompleted) {
      setSelectedName(firstCompleted);
      return;
    }
    const fallback = allExerciseNameOptions[0];
    if (fallback) setSelectedName(fallback);
  }, [selectedName, completedExercises, allExerciseNameOptions]);

  // Seed the apparatus ONLY on first load (while still empty), picking one that
  // has data for the seeded name so the initial view isn't empty. After that we
  // never auto-correct: the user can freely pick any name/apparatus, and a combo
  // with no history just shows the NoDataPlaceholder.
  useEffect(() => {
    if (!selectedName || selectedApparatus) return;
    const firstMatch = completedExercises?.previous.find(
      (ex) => ex.name === selectedName,
    );
    if (firstMatch) {
      setSelectedApparatus(firstMatch.apparatus);
      return;
    }
    const fallback = allExerciseApparatusOptions[0];
    if (fallback) setSelectedApparatus(fallback);
  }, [
    selectedName,
    selectedApparatus,
    completedExercises,
    allExerciseApparatusOptions,
  ]);

  if (
    isUserLoading ||
    completedExercisesLoading ||
    !selectedName ||
    !selectedApparatus
  )
    return <LogoSpinner />;

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
          setSelectedName={setSelectedName}
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
