import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type TabParamList = {
  // CompleteSession's "full progress" button deep-links here with a preset
  // exercise/equipment.
  Progress: { name?: string; equipment?: string } | undefined;
  Dashboard: undefined;
  Program: { duplicateFrom?: string } | undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CompleteSession: undefined;
  Account: undefined;
};

// Navigation prop for a tab screen that also needs to reach the parent stack
// (e.g. Dashboard → CompleteSession). Composing the two lets `navigate` accept both
// sibling-tab and parent-stack destinations with full typing.
export type TabNav<T extends keyof TabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;
