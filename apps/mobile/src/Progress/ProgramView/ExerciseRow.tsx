import { Exercise, Set } from "@liftledger/shared";
import { View } from "react-native";
import { EquipmentSelect } from "../../components/EquipmentSelect";
import { ExerciseNameSelect } from "../../components/ExerciseNameSelect";
import { UnitSelect } from "../../components/UnitSelect";
import { SPACING } from "../../theme";
import { AccordionRow } from "./AccordionRow";
import { SetRow } from "./SetRow";

interface Props {
  exercise: Exercise;
  onChange: (exercise: Exercise) => void;
}

export const ExerciseRow = ({ exercise, onChange }: Props) => {
  const setWorkingSet = (idx: number, set: Set) =>
    onChange({
      ...exercise,
      workingSets: exercise.workingSets.toSpliced(idx, 1, set),
    });

  return (
    <AccordionRow
      title={exercise.name || "Exercise"}
      subtitle={exercise.equipment}
    >
      <View style={{ flexDirection: "row", gap: SPACING.sm }}>
        <View style={{ flex: 1 }}>
          <ExerciseNameSelect
            label="Exercise"
            value={exercise.name}
            onSelect={(name) => onChange({ ...exercise, name })}
            canAddCustom
          />
        </View>
        <View style={{ flex: 1 }}>
          <EquipmentSelect
            label="Equipment"
            value={exercise.equipment}
            onSelect={(equipment) => onChange({ ...exercise, equipment })}
            canAddCustom
          />
        </View>
      </View>
      <UnitSelect
        label="Unit"
        value={exercise.unit}
        onSelect={(unit) => onChange({ ...exercise, unit })}
      />
      {exercise.workingSets.map((set, idx) => (
        <SetRow
          key={idx}
          set={set}
          label={`Set ${idx + 1}`}
          unit={exercise.unit}
          onChange={(next) => setWorkingSet(idx, next)}
        />
      ))}
    </AccordionRow>
  );
};
