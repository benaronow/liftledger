import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Exercise } from "@liftledger/shared";
import { isExerciseComplete, useCurrentDay } from "@liftledger/api-client";
import { useState } from "react";
import { View } from "react-native";
import { Text, TouchableRipple, useTheme } from "../../paper";
import { AddButton } from "../../components/AddButton";
import { FONT, RADIUS, SPACING } from "../../theme";
import { SetList } from "./SetList/SetList";
import { AddExerciseDialog } from "./AddExerciseDialog/AddExerciseDialog";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";

interface Props {
  exercises: Exercise[];
  isEditing: boolean;
  // Reports each card's y within the scroll content so the screen (which owns
  // the ScrollView) can scroll the current exercise into view.
  onCardLayout: (idx: number, y: number) => void;
}

export const ExerciseList = ({ exercises, isEditing, onCardLayout }: Props) => {
  const { currentExIdx } = useCurrentDay();
  const [addExerciseIdx, setAddExerciseIdx] = useState<number>();
  const [deletingIdx, setDeletingIdx] = useState<number>();
  const { colors } = useTheme();

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      {exercises?.map((exercise, idx) => (
        <View
          key={idx}
          style={{ width: "100%", alignItems: "center", gap: SPACING.sm }}
          onLayout={(e) => onCardLayout(idx, e.nativeEvent.layout.y)}
        >
          {isEditing && <AddButton onPress={() => setAddExerciseIdx(idx)} />}
          <View
            style={{
              width: "100%",
              borderRadius: RADIUS.md,
              overflow: "hidden",
              marginBottom: SPACING.lg,
              // Raised card matching web's box-shadow.
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: SPACING.sm,
                backgroundColor: isExerciseComplete(exercise)
                  ? colors.success
                  : colors.dark,
              }}
            >
              {exercise.addedOn && (
                <Text
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: SPACING.xs,
                    fontSize: 10,
                    fontWeight: "600",
                    letterSpacing: 0.5,
                    color: "white",
                    backgroundColor: colors.container,
                    borderBottomLeftRadius: RADIUS.sm,
                    overflow: "hidden",
                  }}
                >
                  ADD-ON
                </Text>
              )}
              {isEditing && exercise.addedOn && (
                <TouchableRipple
                  style={{
                    position: "absolute",
                    left: SPACING.sm,
                    width: 28,
                    height: 28,
                    borderRadius: RADIUS.sm,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.danger,
                  }}
                  onPress={() => setDeletingIdx(idx)}
                >
                  <MaterialCommunityIcons name="delete" size={14} color="white" />
                </TouchableRipple>
              )}
              <View style={{ width: "100%", alignItems: "center", padding: SPACING.sm }}>
                <Text style={{ color: "white", fontWeight: "600", fontSize: FONT.base }}>{exercise.name}</Text>
                <Text style={{ color: "white", fontWeight: "600", fontSize: FONT.base }}>{exercise.apparatus}</Text>
              </View>
            </View>
            {!isEditing && (
              <SetList
                exercise={exercises[idx]}
                isCurrentExercise={idx === currentExIdx}
              />
            )}
          </View>
        </View>
      ))}
      {isEditing && (
        <AddButton onPress={() => setAddExerciseIdx(exercises.length)} />
      )}

      <AddExerciseDialog
        addExerciseIdx={addExerciseIdx}
        onClose={() => setAddExerciseIdx(undefined)}
      />
      <DeleteExerciseDialog
        deletingIdx={deletingIdx}
        onClose={() => setDeletingIdx(undefined)}
      />
    </View>
  );
};

