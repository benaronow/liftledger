import { View } from "react-native";
import { SectionCard } from "../../components/SectionCard";
import { SPACING } from "../../theme";
import {
  ManageExerciseNames,
  ManageExerciseEquipment,
  ManageGyms,
  ManageUnits,
} from "./optionManagement";

export const ExerciseLists = () => {
  return (
    <SectionCard title="Exercises">
      <View style={{ gap: SPACING.sm }}>
        <ManageExerciseNames />
        <ManageExerciseEquipment />
        <ManageGyms />
        <ManageUnits />
      </View>
    </SectionCard>
  );
};
