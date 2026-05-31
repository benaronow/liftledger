import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  findLatestOccurrence,
  useCompletedExercises,
  useMe,
} from "@liftledger/api-client";
import { useExerciseOptions } from "@/lib/hooks/useExerciseOptions";

interface ProgressContextModel {
  selectedName: string;
  setSelectedName: Dispatch<SetStateAction<string>>;
  selectedApparatus: string;
  setSelectedApparatus: Dispatch<SetStateAction<string>>;
}

const defaultProgressContext: ProgressContextModel = {
  selectedName: "",
  setSelectedName: () => {},
  selectedApparatus: "",
  setSelectedApparatus: () => {},
};

const ProgressContext = createContext<ProgressContextModel>(
  defaultProgressContext,
);

export const ProgressProvider = ({ children }: PropsWithChildren) => {
  const { data: curUser } = useMe();
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();
  const [selectedName, setSelectedName] = useState("");
  const [selectedApparatus, setSelectedApparatus] = useState("");

  useEffect(() => {
    if (selectedName) return;

    const firstCompleted = completedExercises?.previous[0]?.name;
    if (firstCompleted) {
      setSelectedName(firstCompleted);
      return;
    }

    setSelectedName(allExerciseNameOptions[0]);
  }, [completedExercises, allExerciseNameOptions, selectedName]);

  useEffect(() => {
    if (!selectedName) return;

    const matchingOccurrence = findLatestOccurrence(
      completedExercises,
      (e) => e.name === selectedName && e.apparatus === selectedApparatus,
    );
    if (matchingOccurrence) return;

    const firstMatch = completedExercises?.previous.find(
      (ex) => ex.name === selectedName,
    );
    if (firstMatch) {
      setSelectedApparatus(firstMatch.apparatus);
      return;
    }

    setSelectedApparatus(allExerciseApparatusOptions[0]);
  }, [
    selectedName,
    selectedApparatus,
    allExerciseApparatusOptions,
    completedExercises,
  ]);

  return (
    <ProgressContext.Provider
      value={{
        selectedName,
        setSelectedName,
        selectedApparatus,
        setSelectedApparatus,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
