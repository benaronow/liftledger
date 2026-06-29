import { useCompletedExercises, useMe } from "@liftledger/api-client";
import { type CompletedExercise, type Set } from "@liftledger/shared";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { LogoSpinner } from "../../components/LogoSpinner";
import { Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../theme";
import { ExerciseTooltip } from "./ExerciseTooltip";
import { NoDataPlaceholder } from "./NoDataPlaceholder";
import type { ChartPoint } from "./types";

interface Props {
  selectedName: string;
  selectedApparatus: string;
  gym?: string;
}

const fmtKey = (d?: Date) => dayjs(d).format("YYYY-MM-DD");

const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 150;

const Y_AXIS_WIDTH = 40;
const LEFT_PAD = 16;
const RIGHT_PAD = 16;
const INITIAL_SPACING = 12;
const END_SPACING = 12;
const POINTER_RADIUS = 6;

export const ProgressChart = ({
  selectedName,
  selectedApparatus,
  gym,
}: Props) => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { colors } = useTheme();

  const gymColors = useMemo(
    () => [
      colors.primary,
      colors.secondary,
      colors.tertiary,
      colors.tertiaryContainer,
    ],
    [colors],
  );

  const chartExercises = useMemo<CompletedExercise[]>(
    () =>
      (completedExercises?.previous ?? [])
        .filter(
          (e) =>
            e.name === selectedName &&
            e.apparatus === selectedApparatus &&
            (!gym || (e.gym ?? "Gym Unknown") === gym) &&
            e.completedDate &&
            e.sets.some((s) => s.completed),
        )
        .reverse(),
    [selectedName, selectedApparatus, gym, completedExercises],
  );

  const gyms = useMemo(
    () =>
      Array.from(new Set(chartExercises.map((e) => e.gym ?? "Gym Unknown"))),
    [chartExercises],
  );

  const dataSet = useMemo(() => {
    const maxWeight = (e: CompletedExercise) =>
      Math.max(
        ...e.sets.filter((s: Set) => s.completed).map((s) => s.weight ?? 0),
      );

    const gymLines = gyms.map((lineGym, gymIdx) => {
      const color = gymColors[gymIdx % gymColors.length];

      const reals = chartExercises
        .map((e, i) => ({ i, e, v: maxWeight(e) }))
        .filter(({ e }) => (e.gym ?? "Gym Unknown") === lineGym);
      const firstIdx = reals[0].i;
      const lastIdx = reals[reals.length - 1].i;
      const realByIdx = new Map(reals.map((r) => [r.i, r]));

      const interpAt = (i: number) => {
        if (i <= firstIdx) return reals[0].v;
        if (i >= lastIdx) return reals[reals.length - 1].v;
        let lo = reals[0];
        let hi = reals[reals.length - 1];
        for (let k = 0; k < reals.length - 1; k++) {
          if (reals[k].i <= i && i <= reals[k + 1].i) {
            lo = reals[k];
            hi = reals[k + 1];
            break;
          }
        }
        return lo.v + ((hi.v - lo.v) * (i - lo.i)) / (hi.i - lo.i);
      };

      const data: ChartPoint[] = chartExercises.map((e, i) => {
        const real = realByIdx.get(i);
        if (real) {
          return {
            value: real.v,
            rawDate: fmtKey(e.completedDate),
            exercise: e,
            gym: lineGym,
            color,
          };
        }

        return {
          value: interpAt(i),
          hideDataPoint: true,
          hidePointer: true,
          gym: lineGym,
          color,
        };
      });

      return {
        data,
        color,
        thickness: 3,
        dataPointsColor: color,
        startIndex: firstIdx,
        endIndex: lastIdx,
      };
    });

    const carrier = {
      data: chartExercises.map((e) => ({ value: maxWeight(e) })),
      color: "transparent",
      thickness: 0,
      hideDataPoints: true,
      hidePointers: true,
    };

    return [carrier, ...gymLines];
  }, [gyms, chartExercises, gymColors]);

  const { yAxisOffset, maxValue } = useMemo(() => {
    const values = chartExercises.flatMap((e) =>
      e.sets.filter((s) => s.completed).map((s) => s.weight ?? 0),
    );
    if (!values.length) return { yAxisOffset: 0, maxValue: 0 };
    return {
      yAxisOffset: Math.max(0, Math.floor(Math.min(...values) - 5)),
      maxValue: Math.ceil(Math.max(...values) + 5),
    };
  }, [chartExercises]);

  if (isUserLoading || completedExercisesLoading) return <LogoSpinner inline />;
  if (!chartExercises.length) return <NoDataPlaceholder />;

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({
      width: e.nativeEvent.layout.width - SPACING.sm,
      height: e.nativeEvent.layout.height - SPACING.sm,
    });

  const plotWidth = Math.max(
    0,
    size.width - Y_AXIS_WIDTH - LEFT_PAD - RIGHT_PAD - END_SPACING,
  );
  const singlePoint = chartExercises.length <= 1;
  const spacing = singlePoint
    ? 0
    : (plotWidth - INITIAL_SPACING - END_SPACING) / (chartExercises.length - 1);
  const firstSpacing = singlePoint ? plotWidth / 2 : INITIAL_SPACING;
  const pointerXAt = (index: number) => firstSpacing + index * spacing;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.secondaryContainer,
          paddingTop: SPACING.sm,
          paddingLeft: SPACING.sm,
          borderRadius: RADIUS.sm,
        }}
        onLayout={onLayout}
      >
        {size.width > 0 && (
          <LineChart
            dataSet={dataSet}
            width={plotWidth}
            height={Math.max(0, size.height - 40)}
            yAxisLabelWidth={Y_AXIS_WIDTH}
            initialSpacing={firstSpacing}
            endSpacing={END_SPACING}
            spacing={spacing}
            yAxisOffset={yAxisOffset}
            maxValue={maxValue || undefined}
            noOfSections={4}
            rulesType="dashed"
            rulesColor={colors.onSurfaceDisabled}
            yAxisColor={colors.onSurfaceDisabled}
            xAxisColor={colors.onSurfaceDisabled}
            yAxisTextStyle={{ color: colors.onSurface, fontSize: 11 }}
            color={gymColors[0]}
            dataPointsRadius={4}
            pointerConfig={{
              pointerColor: colors.primary,
              pointerColorsForDataSet: [
                "transparent",
                ...gyms.map((_, i) => gymColors[i % gymColors.length]),
              ],
              radius: POINTER_RADIUS,
              showPointerStrip: true,
              pointerStripColor: "white",
              pointerStripWidth: 2,
              pointerLabelWidth: TOOLTIP_WIDTH,
              pointerLabelHeight: TOOLTIP_HEIGHT,
              autoAdjustPointerLabelPosition: true,
              activatePointersOnLongPress: false,
              pointerLabelComponent: (
                items: ChartPoint[],
                _secondary: unknown,
                index: number,
              ) => {
                const W = TOOLTIP_WIDTH;
                const px = pointerXAt(index);
                const gPx = px - (POINTER_RADIUS + 1);
                const giftedTotalWidth =
                  firstSpacing + chartExercises.length * spacing + END_SPACING;
                const giftedLeft =
                  gPx < W / 2
                    ? 7
                    : gPx > giftedTotalWidth - W / 2
                      ? -W - 4
                      : -W / 2 + 5;
                const desiredLeft = Math.max(
                  0,
                  Math.min(px - W / 2, plotWidth - W),
                );
                return (
                  <ExerciseTooltip
                    items={items}
                    width={W}
                    translateX={desiredLeft - (giftedLeft + gPx)}
                  />
                );
              },
            }}
          />
        )}
      </View>
      {!gym && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: SPACING.md,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
          }}
        >
          {gyms.map((g, i) => (
            <View
              key={g}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.xs,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: gymColors[i % gymColors.length],
                }}
              />
              <Text
                style={{
                  color: colors.onSurface,
                  fontSize: FONT.base,
                  fontWeight: "700",
                }}
              >
                {g}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
