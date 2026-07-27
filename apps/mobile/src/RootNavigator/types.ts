import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type ProgressStackParamList = {
  Chart: { name?: string; equipment?: string } | undefined;
  ProgramList: undefined;
  ProgramDetail: { programId: string };
};

export type ProgramStackParamList = {
  Rotation: undefined;
  Session: undefined;
};

export type TabParamList = {
  Progress: NavigatorScreenParams<ProgressStackParamList> | undefined;
  Dashboard: undefined;
  Program: { duplicateFrom?: string } | undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CompleteSession: undefined;
  Account: undefined;
};

export type TabNav<T extends keyof TabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProgressStackNav<T extends keyof ProgressStackParamList> =
  CompositeNavigationProp<
    NativeStackNavigationProp<ProgressStackParamList, T>,
    TabNav<"Progress">
  >;

export type ProgramStackNav<T extends keyof ProgramStackParamList> =
  CompositeNavigationProp<
    NativeStackNavigationProp<ProgramStackParamList, T>,
    TabNav<"Program">
  >;
