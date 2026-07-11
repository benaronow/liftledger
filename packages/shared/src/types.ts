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
  endDate?: Date;
  restDays?: number;
}

export interface TimerPresets {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
}

export interface TimerSettings {
  end?: Date;
  presets: TimerPresets;
  defaultEnabled: boolean;
  defaultTime: number;
  exerciseOverrides: Record<string, number>;
}

// Scope of an option rename: the list only, the current program, or all programs.
export type RenameScope = "list" | "current" | "all";

export interface User {
  _id?: string;
  email: string;
  auth0Id: string;
  username: string;
  fullName: string;
  programs: Program[];
  curProgram?: string;
  timerSettings: TimerSettings;
  options: UserOptions;
}

export interface UserOptions {
  gyms: string[];
  exerciseNames: string[];
  equipment: string[];
  units: string[];
  defaultUnit: string;
}
