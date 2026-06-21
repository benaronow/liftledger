import { StatusBar } from "expo-status-bar";
import { registerTranslation, en } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAppProviders } from "./src/providers/MobileAppProviders";
import { RootNavigator } from "./src/RootNavigator";
import { useThemePreference } from "./src/providers/ThemeProvider";

// react-native-paper-dates requires a registered locale before any picker renders.
registerTranslation("en", en);

const AppContent = () => {
  const { scheme } = useThemePreference();
  return (
    <>
      <RootNavigator />
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileAppProviders>
        <AppContent />
      </MobileAppProviders>
    </SafeAreaProvider>
  );
}
