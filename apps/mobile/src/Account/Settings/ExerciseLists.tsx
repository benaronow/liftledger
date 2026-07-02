import { useState } from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import { ManageExerciseList } from "../../components/ManageExerciseList";
import { SectionCard } from "../../components/SectionCard";
import { SPACING } from "../../theme";

export const ExerciseLists = () => {
  const [managing, setManaging] = useState<"name" | "equipment" | null>(null);

  return (
    <SectionCard title="Exercises">
      <View style={{ gap: SPACING.sm }}>
        <Button
          mode="contained"
          icon="arm-flex"
          onPress={() => setManaging("name")}
        >
          Edit exercises
        </Button>
        <Button
          mode="contained"
          icon="dumbbell"
          onPress={() => setManaging("equipment")}
        >
          Edit equipment
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
    </SectionCard>
  );
};
