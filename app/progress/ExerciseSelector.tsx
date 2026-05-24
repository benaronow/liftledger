import { SearchableSelect } from "../components/SearchableSelect";
import { useExerciseOptions } from "../layoutProviders/ExerciseOptionsProvider";
import { useProgress } from "./ProgressProvider";

export const ExerciseSelector = () => {
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();
  const {
    selectedName,
    setSelectedName,
    selectedApparatus,
    setSelectedApparatus,
  } = useProgress();

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
