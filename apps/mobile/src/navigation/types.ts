import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Bottom tabs mirror the web footer: Progress · History · Dashboard · Edit Block
// · Settings. EditBlock carries an optional `duplicateFrom` block id (set when
// History's "duplicate" action navigates here).
export type TabParamList = {
  Progress: undefined;
  History: undefined;
  Dashboard: undefined;
  EditBlock: { duplicateFrom?: string } | undefined;
  Settings: undefined;
};

// Authed native-stack: the tabs plus the two pushed screens (CompleteDay from
// Dashboard's "Lift!", Profile from the header avatar).
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  CompleteDay: undefined;
  Profile: undefined;
};

// Navigation prop for a tab screen that also needs to reach the parent stack
// (e.g. Dashboard → CompleteDay). Composing the two lets `navigate` accept both
// sibling-tab and parent-stack destinations with full typing.
export type TabNav<T extends keyof TabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;
