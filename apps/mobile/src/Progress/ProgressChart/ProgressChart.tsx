import { useCompletedExercises, useMe } from "@liftledger/api-client";
import { type CompletedExercise, type Set } from "@liftledger/shared";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { LogoSpinner } from "../../components/LogoSpinner";
import { Text, useTheme } from "../../paper";
import { FONT, SPACING } from "../../theme";
import { ExerciseTooltip } from "./ExerciseTooltip";
import { GYM_COLORS } from "./gymColors";
import { NoDataPlaceholder } from "./NoDataPlaceholder";
import type { ChartPoint } from "./types";

interface Props {
  selectedName: string;
  selectedApparatus: string;
}

const fmtKey = (d?: Date) => dayjs(d).format("YYYY-MM-DD");

// Tooltip box size. The chart needs these to position the label clear of its
// edges; HEIGHT is a generous upper bound (date + gym + a few set lines).
const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 150;

// Chart geometry. yAxisWidth is the label gutter on the left; leftPad/rightPad
// are the margins between the drawing and the screen edges. initial/endSpacing
// inset the first/last points from the plot edges.
const Y_AXIS_WIDTH = 40;
// Left/right margins between the drawing and the screen edges. LEFT_PAD matches
// the selector/legend inset (SPACING.lg) so the y-axis labels line up with them.
const LEFT_PAD = 16;
const RIGHT_PAD = 16;
const INITIAL_SPACING = 12;
const END_SPACING = 12;
const POINTER_RADIUS = 6;

export const ProgressChart = ({ selectedName, selectedApparatus }: Props) => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { colors } = useTheme();

  // Completed occurrences of this exercise, oldest → newest (web reverses the
  // newest-first API order).
  const chartExercises = useMemo<CompletedExercise[]>(
    () =>
      (completedExercises?.previous ?? [])
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

  const gyms = useMemo(
    () =>
      Array.from(new Set(chartExercises.map((e) => e.gym ?? "Gym Unknown"))),
    [chartExercises],
  );

  const dataSet = useMemo(
    () =>
      gyms.map((gym, gymIdx) => {
        const color = GYM_COLORS[gymIdx % GYM_COLORS.length];
        const maxWeight = (e: CompletedExercise) =>
          Math.max(
            ...e.sets.filter((s: Set) => s.completed).map((s) => s.weight),
          );

        const firstForGym = chartExercises.find(
          (e) => (e.gym ?? "Gym Unknown") === gym,
        );
        let lastValue = firstForGym ? maxWeight(firstForGym) : 0;

        const data: ChartPoint[] = chartExercises.map((e) => {
          if ((e.gym ?? "Gym Unknown") === gym) {
            lastValue = maxWeight(e);
            return {
              value: lastValue,
              rawDate: fmtKey(e.completedDate),
              exercise: e,
              gym,
              color,
            };
          }
          return { value: lastValue, hideDataPoint: true, gym, color };
        });

        return { data, color, thickness: 3, dataPointsColor: color };
      }),
    [gyms, chartExercises],
  );

  const { yAxisOffset, maxValue } = useMemo(() => {
    const values = chartExercises.flatMap((e) =>
      e.sets.filter((s) => s.completed).map((s) => s.weight),
    );
    if (!values.length) return { yAxisOffset: 0, maxValue: 0 };
    return {
      yAxisOffset: Math.max(0, Math.floor(Math.min(...values) - 5)),
      maxValue: Math.ceil(Math.max(...values) + 5),
    };
  }, [chartExercises]);

  if (isUserLoading || completedExercisesLoading) return <LogoSpinner />;
  if (!chartExercises.length) return <NoDataPlaceholder />;

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });

  // Plot width = container minus the y-axis gutter, the left/right margins, and
  // endSpacing (gifted draws the rules at width + endSpacing, so we subtract it
  // here to land the rules' right edge exactly RIGHT_PAD from the screen edge).
  const plotWidth = Math.max(
    0,
    size.width - Y_AXIS_WIDTH - LEFT_PAD - RIGHT_PAD - END_SPACING,
  );
  const singlePoint = chartExercises.length <= 1;
  // Explicit (non-adjustToWidth) spacing so point x positions are deterministic
  // — the tooltip math below relies on knowing each point's x.
  const spacing = singlePoint
    ? 0
    : (plotWidth - INITIAL_SPACING - END_SPACING) / (chartExercises.length - 1);
  // A lone point can't be spread, so center it; otherwise inset from the edge.
  const firstSpacing = singlePoint ? plotWidth / 2 : INITIAL_SPACING;
  const pointerXAt = (index: number) => firstSpacing + index * spacing;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayout}>
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
            rulesColor={colors.textDisabled}
            yAxisColor={colors.textDisabled}
            xAxisColor={colors.textDisabled}
            yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
            color={GYM_COLORS[0]}
            dataPointsRadius={4}
            pointerConfig={{
              pointerColor: colors.primary,
              radius: POINTER_RADIUS,
              showPointerStrip: true,
              pointerStripColor: "white",
              pointerStripWidth: 2,
              // We keep gifted's vertical auto-adjust (flips above a low point),
              // but override the horizontal: it otherwise throws the label fully
              // to one side near the edges. We want it centered over the point,
              // clamped to the plot. translateX converts gifted's offset into
              // that. pointerLabelHeight is needed for the vertical flip.
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
                // True point center, and gifted's internal pointerX (offset left
                // by pointerRadius + 1; see LineChart setPointerX). The label is
                // positioned at `giftedLeft + gPx`, where giftedLeft comes from
                // gifted's auto-adjust branch (which also keys off gPx).
                const px = pointerXAt(index);
                const gPx = px - (POINTER_RADIUS + 1);
                // gifted's right-edge branch keys off its totalWidth, which sums
                // spacing over ALL n points (= initialSpacing + n*spacing +
                // endSpacing), NOT plotWidth — so we must use the same value or
                // the "flip left" decision diverges for near-right points.
                const giftedTotalWidth =
                  firstSpacing + chartExercises.length * spacing + END_SPACING;
                const giftedLeft =
                  gPx < W / 2
                    ? 7
                    : gPx > giftedTotalWidth - W / 2
                      ? -W - 4
                      : -W / 2 + 5;
                // Center the box on the true point, clamped to the plot.
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
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: SPACING.md,
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
        }}
      >
        {gyms.map((gym, i) => (
          <View
            key={gym}
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
                backgroundColor: GYM_COLORS[i % GYM_COLORS.length],
              }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: FONT.base,
                fontWeight: "700",
              }}
            >
              {gym}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
