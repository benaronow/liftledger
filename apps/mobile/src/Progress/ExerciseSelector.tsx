import { View } from "react-native";
import { ExerciseEquipmentSelect } from "../components/ExerciseEquipmentSelect";
import { ExerciseNameSelect } from "../components/ExerciseNameSelect";
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
        <ExerciseNameSelect
          label="Exercise"
          value={selectedName}
          onSelect={setSelectedName}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ExerciseEquipmentSelect
          label="Equipment"
          value={selectedEquipment}
          onSelect={setSelectedEquipment}
        />
      </View>
    </View>
  );
};
