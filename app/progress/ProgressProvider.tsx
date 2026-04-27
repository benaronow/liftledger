"use client";

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCompletedExercises } from "../layoutProviders/CompletedExercisesProvider";
import { useExerciseOptions } from "../layoutProviders/ExerciseOptionsProvider";

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
  const { completedExercises, findLatestOccurrence } = useCompletedExercises();
  const { allExerciseNameOptions, allExerciseApparatusOptions } =
    useExerciseOptions();
  const [selectedName, setSelectedName] = useState("");
  const [selectedApparatus, setSelectedApparatus] = useState("");

  useEffect(() => {
    if (selectedName) return;

    const firstCompleted = completedExercises.previous[0]?.name;
    if (firstCompleted) {
      setSelectedName(firstCompleted);
      return;
    }

    setSelectedName(allExerciseNameOptions[0]);
  }, [completedExercises, allExerciseNameOptions]);

  useEffect(() => {
    if (!selectedName) return;

    const matchingOccurrence = findLatestOccurrence(
      (e) => e.name === selectedName && e.apparatus === selectedApparatus,
    );
    if (matchingOccurrence) return;

    const firstMatch = completedExercises.previous.find(
      (ex) => ex.name === selectedName,
    );
    if (firstMatch) {
      setSelectedApparatus(firstMatch.apparatus);
      return;
    }

    setSelectedApparatus(allExerciseApparatusOptions[0]);
  }, [
    selectedName,
    allExerciseApparatusOptions,
    findLatestOccurrence,
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
