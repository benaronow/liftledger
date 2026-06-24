import { useExerciseSelection } from "@liftledger/api-client";
import { LogoSpinner } from "@/components/LogoSpinner";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChart } from "./ProgressChart";
import { useSearchParamProgressSelection } from "./useSearchParamProgressSelection";

export const Progress = () => {
  const {
    selectedName,
    selectedApparatus,
    setSelectedName,
    setSelectedApparatus,
  } = useSearchParamProgressSelection();
  const { selectName, isLoading } = useExerciseSelection({
    selectedName,
    selectedApparatus,
    setSelectedName,
    setSelectedApparatus,
  });

  if (isLoading) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column h-100 w-100"
      style={{ padding: "15px 0px" }}
    >
      <ExerciseSelector
        selectedName={selectedName}
        selectedApparatus={selectedApparatus}
        selectName={selectName}
        setSelectedApparatus={setSelectedApparatus}
      />
      <ProgressChart
        selectedName={selectedName}
        selectedApparatus={selectedApparatus}
      />
    </div>
  );
};
