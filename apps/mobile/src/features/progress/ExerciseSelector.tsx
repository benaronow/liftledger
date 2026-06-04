import { useExerciseOptions } from "@liftledger/api-client";
import { StyleSheet, View } from "react-native";
import { SearchableSelect } from "../../components/SearchableSelect";
import { SPACING } from "../../theme";

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
    <View style={styles.row}>
      <View style={styles.cell}>
        <SearchableSelect
          value={selectedName}
          options={allExerciseNameOptions}
          onSelect={setSelectedName}
          placeholder="Exercise"
        />
      </View>
      <View style={styles.cell}>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cell: { flex: 1 },
});
