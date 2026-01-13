import { ArrowBackIosNew } from "@mui/icons-material";
import { LabeledInput } from "../../components/LabeledInput";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, useMemo } from "react";
import { Exercise, Set, WeightType } from "@/lib/types";
import { useBlock } from "@/app/providers/BlockProvider";
import {
  getAvailableOptions,
  getNewSetsFromLatest,
  switchExercise,
} from "@/lib/blockUtils";
import { COLORS } from "@/lib/colors";
import { Info, InfoAction } from "../Info";

interface Props {
  exercise: Exercise;
  eIdx: number;
  editingDayIdx: number;
  setDeletingIdx: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export const ExerciseInfo = ({
  exercise,
  eIdx,
  editingDayIdx,
  setDeletingIdx,
}: Props) => {
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const pointFive = useMemo(
    () => exercise.sets[0]?.weight % 1 === 0.5,
    [exercise.sets]
  );

  const handleMoveExercise = (type: "up" | "down") => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day, dIdx) =>
              dIdx === editingDayIdx
                ? {
                    ...day,
                    exercises: day.exercises
                      .toSpliced(eIdx, 1)
                      .toSpliced(
                        type === "up" ? eIdx - 1 : eIdx + 1,
                        0,
                        exercise
                      ),
                  }
                : day
            )
          : week
      ),
    });
  };

  const updateExercise = (exerciseUpdate: Exercise) => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx
          ? week.map((day, dIdx) =>
              dIdx === editingDayIdx
                ? {
                    ...day,
                    exercises: day.exercises.map((exercise, idx) =>
                      eIdx === idx ? exerciseUpdate : exercise
                    ),
                  }
                : day
            )
          : week
      ),
    });
  };

  const handleNumberInput = (
    e: ChangeEvent<HTMLInputElement>,
    type: "sets" | "reps" | "weight"
  ) => {
    const value = parseInt(e.target.value)
      ? Math.min(
          parseInt(e.target.value),
          type === "sets" ? 999 : parseInt(e.target.value)
        )
      : 0;

    updateExercise({
      ...exercise,
      sets:
        type === "sets"
          ? getNewSetsFromLatest(curBlock, exercise, value)
          : exercise.sets.map((set: Set) => ({
              ...set,
              reps: type === "reps" ? value : set.reps,
              weight:
                type === "weight" ? value + (pointFive ? 0.5 : 0) : set.weight,
            })),
    });
  };

  const handlePointFive = (selected: boolean) => {
    updateExercise({
      ...exercise,
      sets: exercise.sets.map((set: Set) => ({
        ...set,
        weight: Math.floor(set.weight) + (selected ? 0.5 : 0),
      })),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(90deg)" }}
        />
      ),
      disabled: eIdx === 0,
      onClick: () => handleMoveExercise("up"),
      variant: "primary",
    },
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(270deg)" }}
        />
      ),
      disabled:
        eIdx ===
        templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.length - 1,
      onClick: () => handleMoveExercise("down"),
      variant: "primary",
    },
    {
      icon: <FaTrash fontSize="medium" />,
      disabled:
        templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.length ===
        1,
      onClick: () => setDeletingIdx(eIdx),
      variant: "danger",
    },
  ];

  const editDisabled = useMemo(() => {
    return !exercise.sets.length;
  }, [exercise]);

  return (
    <Info title={`Exercise ${eIdx + 1}`} actions={infoActions}>
      <LabeledInput
        label="Exercise:"
        textValue={exercise.name}
        options={getAvailableOptions(
          exercise,
          templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises,
          "name"
        )}
        includeEmptyOption
        onChangeSelect={(e) =>
          switchExercise(e, "name", curBlock, exercise, updateExercise)
        }
      />
      <LabeledInput
        label="Apparatus:"
        textValue={exercise.apparatus}
        options={getAvailableOptions(
          exercise,
          templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises,
          "apparatus"
        )}
        includeEmptyOption
        onChangeSelect={(e) =>
          switchExercise(e, "apparatus", curBlock, exercise, updateExercise)
        }
      />
      <div className="d-flex w-100 gap-3">
        <LabeledInput
          label="Sets:"
          textValue={exercise.sets.filter((set) => !set.addedOn).length}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
            handleNumberInput(e, "sets");
          }}
        />
        {!curBlock && (
          <LabeledInput
            label="Reps:"
            textValue={exercise.sets[0]?.reps || 0}
            onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "reps");
            }}
            disabled={editDisabled}
          />
        )}
      </div>
      {!curBlock && (
        <div className="d-flex w-100 align-items-end">
          <LabeledInput
            label="Weight:"
            textValue={Math.floor(exercise.sets[0]?.weight) || 0}
            onChangeText={(e: ChangeEvent<HTMLInputElement>) => {
              handleNumberInput(e, "weight");
            }}
            disabled={editDisabled}
          />
          <button
            className="d-flex align-items-center p-1 rounded border-0 ms-1 me-3"
            style={{
              ...(editDisabled
                ? {
                    color: pointFive
                      ? COLORS.textDisabled
                      : COLORS.primaryDisabled,
                    background: pointFive
                      ? COLORS.primaryDisabled
                      : COLORS.textDisabled,
                  }
                : {
                    color: pointFive ? "white" : COLORS.primary,
                    background: pointFive ? COLORS.primary : "white",
                  }),
              height: 35,
            }}
            onClick={() => handlePointFive(!pointFive)}
          >
            <span>+0.5lbs</span>
          </button>
          <LabeledInput
            label="Weight type:"
            textValue={exercise.weightType}
            options={Object.values(WeightType)}
            includeEmptyOption
            onChangeSelect={(e) =>
              switchExercise(
                e,
                "weightType",
                curBlock,
                exercise,
                updateExercise
              )
            }
          />
        </div>
      )}
    </Info>
  );
};
