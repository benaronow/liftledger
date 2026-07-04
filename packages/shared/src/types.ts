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

export interface User {
  _id?: string;
  email: string;
  auth0Id: string;
  username: string;
  fullName: string;
  programs: Program[];
  curProgram?: string;
  timerSettings: TimerSettings;
  gyms: string[];
  exerciseNames: string[];
  exerciseEquipment: string[];
  units: string[];
  defaultUnit: string;
}
