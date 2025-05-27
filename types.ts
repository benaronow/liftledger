enum Muscle {
  Traps = "Traps",
  Rhomboids = "Rhomboids",
  FrontDelts = "Front Delts",
  SideDelts = "Side Delts",
  RearDelts = "Rear Delts",
  Biceps = "Biceps",
  Triceps = "Triceps",
  Brachialis = "Brachialis",
  Brachioradialis = "Brachioradialis",
  Forearms = "Forearms",
  Pecs = "Pecs",
  Abs = "Abs",
  Obliques = "Obliques",
  Lats = "Lats",
  ErectorSpinae = "Erector Spinae",
  Glutes = "Glutes",
  Adductors = "Adductors",
  Abductors = "Abductors",
  Quads = "Quads",
  Hamstrings = "Hamstrings",
  Calves = "Calves",
}

export enum ExerciseName {
  BenchPress = "Bench Press",
  InclineBenchPress = "Incline Bench Press",
  ChestPress = "Chest Press",
  SqueezePress = "Squeeze Press",
  ChestFly = "Chest Fly",
  StandingOverheadPress = "Standing Overhead Press",
  SeatedOverheadPress = "Seated Overhead Press",
  ArnoldPress = "Arnold Press",
  FrontRaises = "Front Raise",
  LateralRaises = "Lateral Raise",
  BentOverRow = "Bent Over Row",
  PendlayRow = "Pendlay Row",
  SeatedRow = "Seated Row",
  Pullup = "Pullup",
  Chinup = "Chinup",
  Pulldown = "Pulldown",
  Pullover = "Pullover",
  RearDeltFly = "Rear Delt Fly",
  FacePull = "Face Pull",
  GoodMorning = "Good Morning",
  BackExtension = "Back Extension",
  BackSquat = "Back Squat",
  FrontSquat = "Front Squat",
  ZercherSquat = "Zercher Squat",
  HackSquat = "Hack Squat",
  LegPress = "Leg Press",
  Deadlift = "Deadlift",
  RomanianDeadLift = "Romanian Deadlift",
  HamstringCurl = "Hamstring Curl",
  LegExtension = "Leg Extension",
  CalfRaise = "Calf Raise",
  HipThrust = "Hip Thrust",
  HipAdduction = "Hip Adduction",
  HipAbduction = "Hip Abduction",
  SplitSquat = "Split Squat",
  BulgarianSplitSquat = "Bulgarian Split Squat",
  Lunge = "Lunge",
  ReverseLunge = "Reverse Lunge",
  Shrug = "Shrug",
  FarmersCarry = "Farmer's Carry",
  SuitcaseCarry = "Suitcase Carry",
  BicepCurl = "Bicep Curl",
  HammerCurl = "Hammer Curl",
  PreacherCurl = "Preacher Curl",
  SpiderCurl = "Spider Curl",
  InclineCurl = "Incline Curl",
  ReverseCurl = "Reverse Curl",
  ZottmanCurl = "Zottman Curl",
  ConcentrationCurl = "Concentration Curl",
  TricepOverheadExtension = "Tricep Overhead Extension",
  TricepCrossbodyExtension = "Tricep Cross-body Extension",
  TricepPushdown = "Tricep Pushdown",
  Dip = "Dip",
  Skullcrusher = "Skullcrusher",
  CloseGripPress = "Close Grip Press",
  JMPress = "JM Press",
  TricepKickback = "TricepKickback",
  ForearmCurl = "Forearm Curl",
  ReverseForearmCurl = "Reverse Forearm Curl",
  Crunch = "Crunch",
  DeclineCrunch = "Decline Crunch",
  CableCrunch = "Cable Crunch",
  LyingLegRaise = "Lying Leg Raise",
  HangingKneeRaise = "Hanging Knee Raise",
  HangingLegRaise = "Hanging Leg Raise",
  RussianTwist = "Russian Twist",
}

export enum ExerciseApparatus {
  Barbell = "Barbell",
  StraightBar = "Straight Bar",
  EZCurlBar = "EZ Curl Bar",
  Dumbell = "Dumbell",
  SmithMachine = "Smith Machine",
  CableMachine = "Cable Machine",
  DedicatedMachine = "Dedicated Machine",
  Chain = "Chain",
  Band = "Band",
  Bodyweight = "Bodyweight",
}

export enum WeightType {
  Pounds = "lbs",
  Kilograms = "kgs",
}

export interface Set {
  reps: number;
  weight: number;
  note: string;
  completed: boolean;
}

export interface Exercise {
  _id?: string;
  name: string;
  apparatus: string;
  musclesWorked?: Muscle[];
  sets: Set[];
  weightType: string;
}

export interface TableExercise extends Exercise {
  week: number;
  sub?: number;
  up: boolean;
  down: boolean;
}

export interface Day {
  _id?: string;
  name: string;
  exercises: Exercise[];
  completedDate?: Date | undefined;
}

// export interface TableDay extends Day {
//   week: number;
//   sub?: number;
// }

export interface Week {
  _id?: string;
  number: number;
  days: Day[];
}

export interface Block {
  _id?: string;
  name: string;
  startDate: Date;
  length: number;
  initialWeek: Week;
  weeks: Week[];
  curWeekIdx: number;
  curDayIdx: number;
}

// export interface ExerciseProgress {
//   [key: string]: (number | number[] | string | Date)[][];
// }

export interface User {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  blocks: Block[];
  curBlock: string;
}

export interface GetParams {
  params: Promise<{ id: string }>;
}

export interface SizeInfo {
  innerWidth: number | undefined;
  innerHeight: number | undefined;
}

// export interface TableData {
//   [key: string]: string | string[];
// }

export enum BlockOp {
  Create = "create",
  Edit = "edit",
  NewWeek = "newWeek",
}

export enum RouteType {
  Signup = "/create-account",
  Progress = "/progress",
  History = "/history",
  Home = "/dashboard",
  Add = "/create-block",
  Profile = "/profile",
  Settings = "/settings",
  Workout = "/complete-day",
}
