import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

// Container-level ref so global overlays that live outside any navigator screen
// (the timer-finished overlay) can read the current route and navigate. This is
// React Navigation's recommended pattern for navigating without a screen's
// `useNavigation`.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
