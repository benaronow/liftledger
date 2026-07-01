import { useExerciseOptions } from "@liftledger/api-client";
import { View } from "react-native";
import { SearchableSelect } from "../components/SearchableSelect";
import { SPACING } from "../theme";

interface Props {
  selectedName: string;
  selectedEquipment: string;
  setSelectedName: (name: string) => void;
  setSelectedEquipment: (equipment: string) => void;
}

export const ExerciseSelector = ({
  selectedName,
  selectedEquipment,
  setSelectedName,
  setSelectedEquipment,
}: Props) => {
  const { allExerciseNameOptions, allExerciseEquipmentOptions } =
    useExerciseOptions();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <SearchableSelect
          label="Exercise"
          value={selectedName}
          options={allExerciseNameOptions}
          onSelect={setSelectedName}
          placeholder="Enter exercise..."
        />
      </View>
      <View style={{ flex: 1 }}>
        <SearchableSelect
          label="Equipment"
          value={selectedEquipment}
          options={allExerciseEquipmentOptions}
          onSelect={setSelectedEquipment}
          placeholder="Enter equipment..."
        />
      </View>
    </View>
  );
};
