import { StatusBar } from "expo-status-bar";
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
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
