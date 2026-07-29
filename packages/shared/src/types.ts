export interface Set {
  reps: number | null;
  weight: number | null;
  note: string;
  completed: boolean;
  skipped?: boolean;
  addedOn?: boolean;
  dropSets?: Set[];
}

export interface Exercise {
  _id?: string;
  name: string;
  equipment: string;
  gym?: string;
  workingSets: Set[];
  warmupSets?: Set[];
  unit: string;
  addedOn?: boolean;
}

export interface CompletedExercise {
  name: string;
  equipment: string;
  gym?: string;
  workingSets: Set[];
  warmupSets?: Set[];
  unit: string;
  completedDate?: Date;
}

export interface Session {
  _id?: string;
  name: string;
  gym?: string;
  exercises: Exercise[];
  completedDate: Date | undefined;
}

export interface Program {
  _id?: string;
  name: string;
  length: number;
  primaryGym?: string;
  rotations: Session[][];
  curRotationIdx: number;
  curSessionIdx: number;
  restDays?: number;
}

export interface ProgramSummary {
  _id: string;
  name: string;
  startDate?: Date;
  endDate?: Date;
  rotationCount: number;
  sessionCount: number;
  restDays: number;
  curRotationIdx: number;
  volume: number;
  unit: string;
  workoutDays: { day: number; rotationIdx: number }[];
}

export interface TimerPresets {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
}

export type TimerAlarm = "alarm_1" | "alarm_2" | "alarm_3" | "alarm_4" | "none";

export interface TimerSettings {
  presets: TimerPresets;
  defaultEnabled: boolean;
  defaultTime: number;
  exerciseOverrides: Record<string, number>;
  notify: boolean;
  alarm: TimerAlarm;
}

export interface Timer {
  end?: Date;
  settings: TimerSettings;
}

export type RenameScope = "list" | "current" | "all";

export interface User {
  _id?: string;
  email: string;
  auth0Id: string;
  username: string;
  fullName: string;
  programs: string[];
  curProgram?: string;
  timer: Timer;
  options: UserOptions;
}

export interface UserOptions {
  gyms: string[];
  exerciseNames: string[];
  equipment: string[];
  units: string[];
  defaultUnit: string;
}
