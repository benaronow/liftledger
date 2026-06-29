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

export const EditDay = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const {
    templateProgram,
    setTemplateProgram,
    editingWeekIdx,
    editingDayIdx,
    templateErrors,
  } = useTemplate();
  const [deletingExerciseIdx, setDeletingExerciseIdx] = useState<
    number | undefined
  >(undefined);

  const day = templateProgram.weeks[editingWeekIdx][editingDayIdx];
  const visibleExercises = day.exercises.filter((e) => !e.addedOn);

  const handleDayNameInput = (text: string) => {
    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((d, dIdx) =>
              dIdx === editingDayIdx ? { ...d, name: text } : d,
            )
          : week,
      ),
    });
  };

  const handleAddExercise = (idx: number) => {
    const newExercise: Exercise = {
      name: "",
      apparatus: "",
      gym: templateProgram.primaryGym || "",
      sets: [{ reps: null, weight: null, completed: false, note: "" }],
      weightType: curProgram ? "lbs" : "",
    };

    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((d, dIdx) =>
              dIdx === editingDayIdx
                ? {
                    ...d,
                    exercises: d.exercises.toSpliced(idx, 0, newExercise),
                  }
                : d,
            )
          : week,
      ),
    });
  };

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <SectionCard title="Day Details" style={{ marginBottom: SPACING.lg }}>
        <AppTextInput
          label="Day Name"
          value={day.name}
          error={templateErrors.days[editingDayIdx]?.name}
          onChangeText={handleDayNameInput}
          autoCapitalize="none"
        />
      </SectionCard>
      {visibleExercises.map((exercise, idx) => (
        <View key={idx} style={{ width: "100%", alignItems: "center" }}>
          {/* Insert before this visible exercise's real position in the full
              array, so a hidden addedOn exercise doesn't shift the insert. */}
          <AddRow
            onPress={() =>
              handleAddExercise(fullExerciseIndex(day.exercises, idx))
            }
          />
          <ExerciseInfo
            exercise={exercise}
            eIdx={idx}
            onRequestDelete={setDeletingExerciseIdx}
          />
        </View>
      ))}
      <AddRow onPress={() => handleAddExercise(day.exercises.length)} />

      <DeleteExerciseDialog
        deletingExerciseIdx={deletingExerciseIdx}
        onClose={() => setDeletingExerciseIdx(undefined)}
      />
    </View>
  );
};
