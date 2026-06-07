import { useExerciseOptions } from "@liftledger/api-client";
import { View } from "react-native";
import { SearchableSelect } from "../components/SearchableSelect";
import { SPACING } from "../theme";

interface Props {
  selectedName: string;
  selectedApparatus: string;
  setSelectedName: (name: string) => void;
  setSelectedApparatus: (apparatus: string) => void;
}

export const ExerciseSelector = ({
  selectedName,
  selectedApparatus,
  setSelectedName,
  setSelectedApparatus,
}: Props) => {
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
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
          label="Apparatus"
          value={selectedApparatus}
          options={allExerciseApparatusOptions}
          onSelect={setSelectedApparatus}
          placeholder="Enter apparatus..."
        />
      </View>
    </View>
  );
};
