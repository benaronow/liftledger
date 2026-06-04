import { SearchableSelect } from "../components/SearchableSelect";
import { useExerciseOptions } from "@liftledger/api-client";
import { useProgressSelection } from "./useProgressSelection";

export const ExerciseSelector = () => {
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();
  const {
    selectedName,
    setSelectedName,
    selectedApparatus,
    setSelectedApparatus,
  } = useProgressSelection();

  return (
    <div className="d-flex gap-2 mb-3">
      <SearchableSelect
        value={selectedName}
        options={allExerciseNameOptions}
        onSelect={setSelectedName}
      />
      <SearchableSelect
        value={selectedApparatus}
        options={allExerciseApparatusOptions}
        onSelect={setSelectedApparatus}
      />
    </div>
  );
};
