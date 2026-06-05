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

const cellStyle = { flex: 1 };

export const ExerciseSelector = ({
  selectedName,
  selectedApparatus,
  setSelectedName,
  setSelectedApparatus,
}: Props) => {
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();

  return (
    <View style={{ flexDirection: "row", gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
      <View style={cellStyle}>
        <SearchableSelect
          value={selectedName}
          options={allExerciseNameOptions}
          onSelect={setSelectedName}
          placeholder="Exercise"
        />
      </View>
      <View style={cellStyle}>
        <SearchableSelect
          value={selectedApparatus}
          options={allExerciseApparatusOptions}
          onSelect={setSelectedApparatus}
          placeholder="Apparatus"
        />
      </View>
    </View>
  );
};
