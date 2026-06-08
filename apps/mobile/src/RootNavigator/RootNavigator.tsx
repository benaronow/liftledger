import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { useTheme } from "../paper";
import { LogoSpinner } from "../components/LogoSpinner";
import { useThemePreference } from "../providers/ThemeProvider";
import { Welcome } from "../Welcome";
import { AuthenticatedRouter } from "./AuthenticatedRouter";

const AuthStack = createNativeStackNavigator();

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
        <AuthenticatedRouter />
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
