import { AddButton } from "@/components/AddButton";
import { DARK_COLORS, Exercise } from "@liftledger/shared";
import { FaTrash } from "react-icons/fa";
import { SetList } from "./SetList";
import { AddExerciseDialog } from "./AddExerciseDialog";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { useState } from "react";
import { isExerciseComplete, useCurrentDay } from "@liftledger/api-client";
import { useTheme } from "@/providers/ThemeProvider";

interface Props {
  exercises: Exercise[];
  isEditing: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ExerciseList = ({ exercises, isEditing, containerRef }: Props) => {
  const { currentExIdx } = useCurrentDay();
  const [addExerciseIdx, setAddExerciseIdx] = useState<number>();
  const [deletingIdx, setDeletingIdx] = useState<number>();
  const { colors } = useTheme();

  return (
    <>
      <div className="d-flex flex-column align-items-center w-100">
        {exercises?.map((exercise, idx) => (
          <div
            className="d-flex flex-column align-items-center w-100 gap-2"
            key={idx}
          >
            {isEditing && <AddButton onClick={() => setAddExerciseIdx(idx)} />}
            <div
              id={exercise.name + exercise.apparatus}
              className={`d-flex flex-column align-items-center w-100 rounded overflow-hidden mb-${
                idx === exercises.length - 1 ? "3" : "4"
              }`}
              style={{ boxShadow: `0px 5px 10px ${colors.dark}` }}
            >
              <div
                className="w-100 d-flex align-items-center justify-content-center px-2 position-relative"
                style={{
                  background: isExerciseComplete(exercise)
                    ? COLORS.success
                    : colors.dark,
                }}
              >
                {exercise.addedOn && (
                  <span
                    className="position-absolute top-0 end-0 px-2 py-1 fw-semibold"
                    style={{
                      fontSize: "10px",
                      background: DARK_COLORS.container,
                      color: "white",
                      borderBottomLeftRadius: 6,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ADD-ON
                  </span>
                )}
                {isEditing && exercise.addedOn && (
                  <button
                    className="border-0 rounded d-flex align-items-center justify-content-center position-absolute start-0 ms-2"
                    style={{
                      background: COLORS.danger,
                      color: "white",
                      width: 28,
                      height: 28,
                    }}
                    onClick={() => setDeletingIdx(idx)}
                  >
                    <FaTrash fontSize={12} />
                  </button>
                )}
                <div
                  className="w-100 d-flex flex-column align-items-center p-2 text-nowrap text-white fw-semibold"
                  style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
                >
                  <span>{exercise.name}</span>
                  <span>{exercise.apparatus}</span>
                </div>
              </div>
              {!isEditing && (
                <SetList
                  exercise={exercises[idx]}
                  isCurrentExercise={idx === currentExIdx}
                  containerRef={containerRef}
                />
              )}
            </div>
          </div>
        ))}
        {isEditing && (
          <AddButton onClick={() => setAddExerciseIdx(exercises.length)} />
        )}
      </div>
      <AddExerciseDialog
        addExerciseIdx={addExerciseIdx}
        onClose={() => setAddExerciseIdx(undefined)}
      />
      <DeleteExerciseDialog
        deletingIdx={deletingIdx}
        onClose={() => setDeletingIdx(undefined)}
      />
    </>
  );
};
