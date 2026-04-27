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
      <select
        value={selectedName}
        onChange={(e) => setSelectedName(e.target.value)}
        className="w-100 py-2 px-1 border-0 rounded text-truncate overflow-hidden"
        style={{ outline: "none" }}
      >
        {allExerciseNameOptions.map((name) => (
          <option key={name} value={name} style={{ color: "white" }}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={selectedApparatus}
        onChange={(e) => setSelectedApparatus(e.target.value)}
        className="w-100 py-2 px-1 border-0 rounded text-truncate overflow-hidden"
        style={{ outline: "none" }}
      >
        {allExerciseApparatusOptions.map((apparatus) => (
          <option key={apparatus} value={apparatus} style={{ color: "white" }}>
            {apparatus}
          </option>
        ))}
      </select>
    </div>
  );
};
