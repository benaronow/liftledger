const UNIT_LABELS: Record<string, string> = {
  lbs: "Weight",
  kgs: "Weight",
  stone: "Weight",
  feet: "Distance",
  yards: "Distance",
  meters: "Distance",
  seconds: "Time",
  minutes: "Time",
};

export const DEFAULT_UNITS: string[] = Object.keys(UNIT_LABELS);

export const getUnitLabel = (unit: string | undefined): string =>
  (unit && UNIT_LABELS[unit]) || "Unit";
