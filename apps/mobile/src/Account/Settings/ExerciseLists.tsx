import { useState } from "react";
import { View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { ManageExerciseList } from "../../components/ManageExerciseList";
import { SectionCard } from "../../components/SectionCard";
import { SPACING } from "../../theme";

export const ExerciseLists = () => {
  const [managing, setManaging] = useState<
    "name" | "equipment" | "unit" | null
  >(null);
  const { colors } = useTheme();

  return (
    <SectionCard title="Exercises">
      <View style={{ gap: SPACING.sm }}>
        <Button
          mode="outlined"
          style={{ backgroundColor: colors.background }}
          onPress={() => setManaging("name")}
        >
          Edit exercises
        </Button>
        <Button
          mode="outlined"
          style={{ backgroundColor: colors.background }}
          onPress={() => setManaging("equipment")}
        >
          Edit equipment
        </Button>
        <Button
          mode="outlined"
          style={{ backgroundColor: colors.background }}
          onPress={() => setManaging("unit")}
        >
          Edit units
        </Button>
      </View>
      <ManageExerciseList
        field="name"
        open={managing === "name"}
        onClose={() => setManaging(null)}
      />
      <ManageExerciseList
        field="equipment"
        open={managing === "equipment"}
        onClose={() => setManaging(null)}
      />
      <ManageExerciseList
        field="unit"
        open={managing === "unit"}
        onClose={() => setManaging(null)}
      />
    </SectionCard>
  );
};
