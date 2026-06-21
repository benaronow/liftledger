export interface Set {
  reps: number;
  weight: number;
  note: string;
  completed: boolean;
  skipped?: boolean;
  addedOn?: boolean;
}

export interface Exercise {
  _id?: string;
  name: string;
  apparatus: string;
  gym?: string;
  sets: Set[];
  weightType: string;
  addedOn?: boolean;
}

export interface CompletedExercise {
  name: string;
  apparatus: string;
  gym?: string;
  sets: Set[];
  weightType: string;
  completedDate?: Date;
}

export interface Day {
  _id?: string;
  name: string;
  gym?: string;
  exercises: Exercise[];
  completedDate: Date | undefined;
}

export interface Program {
  _id?: string;
  name: string;
  startDate: Date;
  length: number;
  primaryGym?: string;
  weeks: Day[][];
  curWeekIdx: number;
  curDayIdx: number;
  endDate?: Date;
}

export interface TimerPresets {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
}

export interface User {
  _id?: string;
  email: string;
  auth0Id: string;
  username: string;
  fullName: string;
  birthday: string;
  programs: Program[];
  curProgram?: string;
  timerEnd?: Date;
  timerPresets: TimerPresets;
  gyms: string[];
  customExerciseNames: string[];
  customExerciseApparatuses: string[];
}
