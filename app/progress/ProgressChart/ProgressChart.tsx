import { COLORS } from "@/lib/colors";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GYM_COLORS } from "./gymColors";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useCompletedExercises } from "@/app/layoutProviders/CompletedExercisesProvider";
import { useProgress } from "../ProgressProvider";
import "./progressChart.css";
import { ExerciseTooltip } from "./ExerciseTooltip";
import { NoDataPlaceholder } from "./NoDataPlaceholder";
import { CompletedExercise, type Set } from "@/lib/types";

export const ProgressChart = () => {
  const { completedExercises } = useCompletedExercises();
  const { selectedName, selectedApparatus } = useProgress();

  const chartExercises = useMemo<CompletedExercise[]>(
    () =>
      completedExercises.previous
        .filter(
          (e) =>
            e.name === selectedName &&
            e.apparatus === selectedApparatus &&
            e.completedDate &&
            e.sets.some((s) => s.completed),
        )
        .reverse(),
    [selectedName, selectedApparatus, completedExercises],
  );

  const chartData = useMemo<Record<string, number | string>[]>(
    () =>
      chartExercises.map((e: CompletedExercise) => {
        const maxSetWeight: number = Math.max(
          ...e.sets.filter((s: Set) => s.completed).map((s: Set) => s.weight),
        );
        const date = dayjs(e.completedDate).format("YYYY-MM-DD");

        return { date, [e.gym ?? "Gym Unknown"]: maxSetWeight };
      }),
    [chartExercises],
  );

  const chartGyms = useMemo<string[]>(
    () =>
      Array.from(new Set(chartExercises.map((e) => e.gym ?? "Gym Unknown"))),
    [chartExercises],
  );

  const yMin = useMemo(() => {
    const weights = chartData.flatMap((entry) =>
      chartGyms
        .map((gym) => entry[gym])
        .filter((v): v is number => typeof v === "number"),
    );
    return weights.length ? Math.min(...weights) - 5 : "auto";
  }, [chartData, chartGyms]);

  return (
    <>
      {chartData.length > 0 ? (
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
          style={{ outline: "none" }}
          responsive
          width="100%"
          height="100%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.container}
            style={{ outline: "none" }}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "white", fontSize: 11 }}
            tickFormatter={(v) => dayjs(v).format("M/D")}
            angle={-45}
            textAnchor="end"
            interval="preserveStartEnd"
            height={55}
          />
          <YAxis
            tick={{ fill: "white", fontSize: 12 }}
            width={45}
            domain={[yMin, "auto"]}
          />
          <Tooltip content={<ExerciseTooltip />} />
          <Legend
            layout="vertical"
            wrapperStyle={{ fontSize: 18, fontWeight: "bold" }}
          />
          {chartGyms.map((gym, i) => (
            <Line
              key={gym}
              dataKey={gym}
              type="monotone"
              stroke={GYM_COLORS[i % GYM_COLORS.length]}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
              connectNulls
            />
          ))}
        </LineChart>
      ) : (
        <NoDataPlaceholder />
      )}
    </>
  );
};
