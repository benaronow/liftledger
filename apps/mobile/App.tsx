import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { registerTranslation, en } from "react-native-paper-dates";
import { AppProviders } from "./src/providers/AppProviders";
import { RootNavigator } from "./src/RootNavigator";
import { useThemePreference } from "./src/providers/ThemeProvider";
import { env } from "./src/config/env";

registerTranslation("en", en);

// LogBox toasts overlay the bottom of the screen and swallow taps aimed at the
// tab bar, which breaks Maestro runs on any dev-only warning. Silence them in
// E2E mode only.
if (env.e2e) LogBox.ignoreAllLogs();

const AppContent = () => {
  const { scheme } = useThemePreference();

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
