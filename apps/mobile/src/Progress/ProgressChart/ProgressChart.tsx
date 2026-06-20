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
  // When set, restrict the chart to a single gym's sessions (CompleteDay shows
  // only the current day's gym). Hides the legend too, since it's redundant.
  gym?: string;
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

  // Completed occurrences of this exercise, oldest → newest (web reverses the
  // newest-first API order).
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
      Math.max(...e.sets.filter((s: Set) => s.completed).map((s) => s.weight));

    const gymLines = gyms.map((lineGym, gymIdx) => {
      const color = GYM_COLORS[gymIdx % GYM_COLORS.length];

      // This gym's real sessions, with their chronological index in the
      // shared x-axis and their plotted value.
      const reals = chartExercises
        .map((e, i) => ({ i, e, v: maxWeight(e) }))
        .filter(({ e }) => (e.gym ?? "Gym Unknown") === lineGym);
      const firstIdx = reals[0].i;
      const lastIdx = reals[reals.length - 1].i;
      const realByIdx = new Map(reals.map((r) => [r.i, r]));

      // Lines in a dataSet share one x-axis indexed by position, so every line
      // must carry a point at every session index. For the gaps between this
      // gym's sessions we interpolate along the straight line joining the
      // bracketing real points (and hide those points) — so the drawn line is a
      // clean segment through the gym's sessions instead of the old flat hold.
      // startIndex/endIndex then clip it to the gym's own span, leaving true
      // chronological gaps before its first and after its last session.
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
        // hidePointer keeps the focus pointer from dropping a dot on this gym's
        // invisible interpolated line when another gym's point is selected.
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

    // Invisible carrier line with a real point at every session. gifted keys
    // the pointer's index/x off dataSet[0], skipping the update when that
    // point has hidePointer — which would otherwise freeze the tooltip's
    // position whenever the dragged index lands on a gym line's hidden
    // interpolated point. The carrier (drawn first, so it's dataSet[0]) keeps
    // the pointer advancing across every point; `hidePointers` stops it drawing
    // its own focus dot, and it filters out of the tooltip since it has no
    // `exercise`.
    const carrier = {
      data: chartExercises.map((e) => ({ value: maxWeight(e) })),
      color: "transparent",
      thickness: 0,
      hideDataPoints: true,
      hidePointers: true,
    };

    return [carrier, ...gymLines];
  }, [gyms, chartExercises]);

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
              // One focus-dot color per dataSet, in the same order
              // (carrier first, then each gym line) so the highlighted point
              // matches its own line's color instead of the global default.
              pointerColorsForDataSet: [
                "transparent",
                ...gyms.map((_, i) => GYM_COLORS[i % GYM_COLORS.length]),
              ],
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
                {g}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
