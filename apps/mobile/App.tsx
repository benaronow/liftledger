import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MobileAppProviders } from "./src/providers/MobileAppProviders";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileAppProviders>
        <RootNavigator />
        <StatusBar style="auto" />
      </MobileAppProviders>
    </SafeAreaProvider>
  );
}
