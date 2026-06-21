// Local re-export of react-native-paper. The only addition is a `useTheme`
// typed to the app's extended theme (AppTheme) so call sites can read custom
// colors (danger, container, dark, …) without a per-call generic. The explicit
// `useTheme` shadows the one from `export *`. Import Paper symbols from here.
export * from "react-native-paper";

import { useTheme as useThemeBase } from "react-native-paper";
import type { AppTheme } from "./paperTheme";

export const useTheme = (): AppTheme => useThemeBase<AppTheme>();
