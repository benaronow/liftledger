import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  type RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { AvatarButton } from "../components/AvatarButton";
import { LogoSpinner } from "../components/LogoSpinner";
import { Timer } from "../components/Timer";
import { Profile } from "../Profile";
import { useTheme } from "../providers/ThemeProvider";
import { CompleteDay } from "../CompleteDay";
import { Welcome } from "../Welcome";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();

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
  const { colors, scheme } = useTheme();

  if (isLoading) return <LogoSpinner />;

  return (
    <NavigationContainer>
      {user ? (
        <>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.dark },
              headerShadowVisible: false,
              headerTintColor: scheme === "dark" ? "white" : "black",
              headerBackButtonDisplayMode: "minimal",
            }}
          >
            <Stack.Screen
              name="Tabs"
              component={TabNavigator}
              options={({ navigation, route }) => ({
                title: tabTitle(route),
                headerRight: () => (
                  <AvatarButton
                    onPress={() => navigation.navigate("Profile")}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="CompleteDay"
              component={CompleteDay}
              options={{ title: "Workout" }}
            />
            <Stack.Screen
              name="Profile"
              component={Profile}
              options={{ title: "Profile" }}
            />
          </Stack.Navigator>
          <Timer />
        </>
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen
            name="Welcome"
            component={Welcome}
            options={{ headerShown: false }}
          />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};
