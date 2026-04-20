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

export interface ExerciseWithDate extends Exercise {
  completedDate?: Date;
}

export interface Day {
  _id?: string;
  name: string;
  gym?: string;
  exercises: Exercise[];
  completedDate: Date | undefined;
}

export interface Block {
  _id?: string;
  name: string;
  startDate: Date;
  length: number;
  primaryGym?: string;
  weeks: Day[][];
  curWeekIdx: number;
  curDayIdx: number;
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
  firstName: string;
  lastName: string;
  birthday: Date;
  blocks: Block[];
  curBlock?: string;
  timerEnd?: Date;
  timerPresets: TimerPresets;
  gyms: string[];
  customExerciseNames: string[];
  customExerciseApparatuses: string[];
}

export interface GetParams {
  params: Promise<{ id: string }>;
}

export enum RouteType {
  Signup = "/create-account",
  Progress = "/progress",
  History = "/history",
  Home = "/dashboard",
  Add = "/edit-block",
  Profile = "/profile",
  Settings = "/settings",
  Workout = "/complete-day",
}
