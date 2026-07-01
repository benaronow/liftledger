import { useProgram, useMe } from "@liftledger/api-client";
import { Exercise } from "@liftledger/shared";
import { useState } from "react";
import { View } from "react-native";
import { SPACING } from "../../../theme";
import { AddRow } from "../../../components/AddRow";
import { AppTextInput } from "../../../components/inputs";
import { SectionCard } from "../../../components/SectionCard";
import { useTemplate } from "../../TemplateProvider";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { fullExerciseIndex } from "./moveExercise";
import { ExerciseInfo } from "./ExerciseInfo";

export const EditSession = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const {
    templateProgram,
    setTemplateProgram,
    editingRotationIdx,
    editingSessionIdx,
    templateErrors,
  } = useTemplate();
  const [deletingExerciseIdx, setDeletingExerciseIdx] = useState<
    number | undefined
  >(undefined);

  const session = templateProgram.rotations[editingRotationIdx][editingSessionIdx];
  const visibleExercises = session.exercises.filter((e) => !e.addedOn);

  const handleSessionNameInput = (text: string) => {
    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((rotation, wIdx) =>
        wIdx === editingRotationIdx
          ? rotation.map((d, dIdx) =>
              dIdx === editingSessionIdx ? { ...d, name: text } : d,
            )
          : rotation,
      ),
    });
  };

  const handleAddExercise = (idx: number) => {
    const newExercise: Exercise = {
      name: "",
      equipment: "",
      gym: templateProgram.primaryGym || "",
      sets: [{ reps: null, weight: null, completed: false, note: "" }],
      weightType: curProgram ? "lbs" : "",
    };

    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((rotation, wIdx) =>
        wIdx === editingRotationIdx
          ? rotation.map((d, dIdx) =>
              dIdx === editingSessionIdx
                ? {
                    ...d,
                    exercises: d.exercises.toSpliced(idx, 0, newExercise),
                  }
                : d,
            )
          : rotation,
      ),
    });
  };

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <SectionCard title="Session Details" style={{ marginBottom: SPACING.lg }}>
        <AppTextInput
          label="Session Name"
          value={session.name}
          error={templateErrors.sessions[editingSessionIdx]?.name}
          onChangeText={handleSessionNameInput}
          autoCapitalize="none"
        />
      </SectionCard>
      {visibleExercises.map((exercise, idx) => (
        <View key={idx} style={{ width: "100%", alignItems: "center" }}>
          {/* Insert before this visible exercise's real position in the full
              array, so a hidden addedOn exercise doesn't shift the insert. */}
          <AddRow
            onPress={() =>
              handleAddExercise(fullExerciseIndex(session.exercises, idx))
            }
          />
          <ExerciseInfo
            exercise={exercise}
            eIdx={idx}
            onRequestDelete={setDeletingExerciseIdx}
          />
        </View>
      ))}
      <AddRow onPress={() => handleAddExercise(session.exercises.length)} />

      <DeleteExerciseDialog
        deletingExerciseIdx={deletingExerciseIdx}
        onClose={() => setDeletingExerciseIdx(undefined)}
      />
    </View>
  );
};
