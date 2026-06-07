import { SearchableSelect } from "../components/SearchableSelect";
import { useExerciseOptions } from "@liftledger/api-client";

interface Props {
  selectedName: string;
  selectedApparatus: string;
  selectName: (name: string) => void;
  setSelectedApparatus: (apparatus: string) => void;
}

export const ExerciseSelector = ({
  selectedName,
  selectedApparatus,
  selectName,
  setSelectedApparatus,
}: Props) => {
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();

  return (
    <div className="d-flex gap-2 mb-3">
      <SearchableSelect
        value={selectedName}
        options={allExerciseNameOptions}
        onSelect={selectName}
      />
      <SearchableSelect
        value={selectedApparatus}
        options={allExerciseApparatusOptions}
        onSelect={setSelectedApparatus}
      />
    </div>
  );
};
