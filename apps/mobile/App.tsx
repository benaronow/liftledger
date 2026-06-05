import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAppProviders } from "./src/providers/MobileAppProviders";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useTheme } from "./src/providers/ThemeProvider";

const AppContent = () => {
  const { scheme } = useTheme();
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
