import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { useProgress } from "../ProgressProvider";
import { COLORS } from "@/lib/colors";
import dayjs from "dayjs";

type Props = {
  active?: boolean;
  payload?: Array<{ name: string; stroke: string; value: number }>;
  label?: string;
};

export const ExerciseTooltip = ({ active, payload, label }: Props) => {
  const { completedExercises } = useCompletedExercises();
  const { selectedName, selectedApparatus } = useProgress();

  if (!active || !payload?.length || !label) return null;

  return (
    <div
      className="rounded py-1 px-2"
      style={{
        background: COLORS.dark,
        color: "white",
      }}
    >
      <div className="fw-bold mb-1" style={{ fontSize: 13 }}>
        {dayjs(label).format("M/D/YY")}
      </div>
      {payload.map((entry) => {
        const gym = entry.name;
        const exercise = completedExercises.previous.find(
          (e) =>
            e.name === selectedName &&
            e.apparatus === selectedApparatus &&
            (e.gym ?? "Gym Unknown") === gym &&
            dayjs(e.completedDate).format("YYYY-MM-DD") === label,
        );

        if (!exercise) return null;

        return (
          <div key={gym} className="mb-1">
            <div
              className="fw-bold mb-1"
              style={{
                fontSize: 14,
                color: entry.stroke,
              }}
            >
              {gym}
            </div>
            {exercise.sets.map((set, idx) => (
              <div key={idx} className="d-flex " style={{ fontSize: 12 }}>
                <span>
                  Set {idx + 1}: {set.weight} {exercise.weightType} × {set.reps}{" "}
                  reps
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
