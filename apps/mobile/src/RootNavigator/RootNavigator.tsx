import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  getFocusedRouteNameFromRoute,
  NavigationContainer,
  type RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { useTheme } from "../paper";
import { AvatarButton } from "./AvatarButton";
import { LogoutButton } from "../components/LogoutButton";
import { LogoSpinner } from "../components/LogoSpinner";
import { Timer } from "../components/Timer";
import { Account } from "../Account";
import { useThemePreference } from "../providers/ThemeProvider";
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
    case "EditBlock":
      return "Edit Block";
    case "Dashboard":
    default:
      return "Home";
  }
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth0();
  const { colors } = useTheme();
  const { scheme } = useThemePreference();

  if (isLoading) return <LogoSpinner />;

  const baseNavTheme = scheme === "dark" ? NavDarkTheme : NavLightTheme;
  const navTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.dark,
      text: colors.text,
      border: colors.dark,
      notification: colors.secondary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
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
                    onPress={() => navigation.navigate("Account")}
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
              name="Account"
              component={Account}
              options={{
                title: "Account",
                headerRight: () => <LogoutButton />,
              }}
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
