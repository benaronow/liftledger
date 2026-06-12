import { useProgram, useMe } from "@liftledger/api-client";
import { Exercise } from "@liftledger/shared";
import { useState } from "react";
import { View } from "react-native";
import { TextInput } from "../../../paper";
import { SPACING } from "../../../theme";
import { AddRow } from "../AddRow";
import { useTemplate } from "../../TemplateProvider";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { ExerciseInfo } from "./ExerciseInfo";

export const EditDay = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { templateProgram, setTemplateProgram, editingWeekIdx, editingDayIdx } =
    useTemplate();
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
      sets: [{ reps: 0, weight: 0, completed: false, note: "" }],
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
      <View style={{ width: "100%", marginBottom: SPACING.lg }}>
        <TextInput
          style={{ height: 45 }}
          outlineStyle={{ borderRadius: 8 }}
          mode="outlined"
          label="Day Name"
          value={day.name}
          onChangeText={handleDayNameInput}
          autoCapitalize="none"
        />
      </View>
      {visibleExercises.map((exercise, idx) => (
        <View key={idx} style={{ width: "100%", alignItems: "center" }}>
          <AddRow onPress={() => handleAddExercise(idx)} />
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
