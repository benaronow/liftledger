import { COLORS } from "@liftledger/shared";
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  type RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { AvatarButton } from "../components/AvatarButton";
import { LogoSpinner } from "../components/LogoSpinner";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { CompleteDayScreen } from "../screens/CompleteDayScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();

// The stack header title for the Tabs screen tracks the focused tab (web's
// per-route header titles). Dashboard reads as "Home" to match web.
const tabTitle = (route: RouteProp<RootStackParamList, "Tabs">): string => {
  switch (getFocusedRouteNameFromRoute(route) ?? "Dashboard") {
    case "Progress":
      return "Progress";
    case "History":
      return "History";
    case "EditBlock":
      return "Edit Block";
    case "Settings":
      return "Settings";
    case "Dashboard":
    default:
      return "Home";
  }
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth0();

  if (isLoading) return <LogoSpinner />;

  return (
    <NavigationContainer>
      {/* Floating Timer overlay is mounted here in M5, above the navigator. */}
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.dark },
            headerTintColor: "white",
            // Arrow-only back control (no "Tabs"/previous-title label).
            headerBackButtonDisplayMode: "minimal",
          }}
        >
          {/* The stack renders the header for every screen — one header
              implementation app-wide, so heights match exactly. */}
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={({ navigation, route }) => ({
              title: tabTitle(route),
              headerRight: () => (
                <AvatarButton onPress={() => navigation.navigate("Profile")} />
              ),
            })}
          />
          <Stack.Screen
            name="CompleteDay"
            component={CompleteDayScreen}
            options={{ title: "Workout" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
        </Stack.Navigator>
      ) : (
        // Unauth gate (Phase 4): the only screen until Auth0 reports a user.
        <AuthStack.Navigator>
          <AuthStack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};
