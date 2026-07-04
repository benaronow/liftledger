import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { registerTranslation, en } from "react-native-paper-dates";
import { AppProviders } from "./src/providers/AppProviders";
import { RootNavigator } from "./src/RootNavigator";
import { useThemePreference } from "./src/providers/ThemeProvider";

registerTranslation("en", en);

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
