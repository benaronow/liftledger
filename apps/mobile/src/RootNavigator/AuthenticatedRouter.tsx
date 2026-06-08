import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { useAuth0Profile, useMe } from "@liftledger/api-client";
import { useTheme } from "../paper";
import { AvatarButton } from "./AvatarButton";
import { LogoutButton } from "../components/LogoutButton";
import { LogoSpinner } from "../components/LogoSpinner";
import { Timer } from "../components/Timer";
import { Account } from "../Account";
import { useThemePreference } from "../providers/ThemeProvider";
import { CompleteDay } from "../CompleteDay";
import { VerifyEmail } from "../onboarding/VerifyEmail";
import { CreateAccount } from "../onboarding/CreateAccount";
import { TabNavigator } from "./TabNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const tabTitle = (route: RouteProp<RootStackParamList, "Tabs">): string => {
  switch (getFocusedRouteNameFromRoute(route) ?? "Dashboard") {
    case "Progress":
      return "Progress";
    case "EditProgram":
      return "Edit Program";
    case "Dashboard":
    default:
      return "Home";
  }
};

// Renders the right surface for an authenticated Auth0 session, gating the main
// app behind onboarding: (1) email must be verified, then (2) a DB user must
// exist. Social logins arrive pre-verified, so the common path makes no extra
// network calls. All hooks run unconditionally; the `enabled` flags keep the
// fetches gated so we don't hit the API before each step applies.
export const AuthenticatedRouter = () => {
  const { user } = useAuth0();
  const { colors } = useTheme();
  const { scheme } = useThemePreference();

  // The ID token already carries email_verified; only consult the live Auth0
  // profile when the token says unverified (e.g. just-completed verification).
  const tokenVerified = user?.email_verified === true;
  const {
    data: profile,
    isLoading: profileLoading,
    mutate: refreshProfile,
  } = useAuth0Profile(!tokenVerified);
  const emailVerified = tokenVerified || !!profile?.emailVerified;

  // Only look up the DB user once email is verified.
  const {
    data: curUser,
    isLoading: userLoading,
    error: userError,
  } = useMe(emailVerified);

  if (!tokenVerified && profileLoading) return <LogoSpinner />;
  if (!emailVerified) return <VerifyEmail onRefresh={refreshProfile} />;

  if (userLoading && !curUser && !userError) return <LogoSpinner />;
  // A 404 (no DB user yet) falls through here to the creation form.
  if (!curUser) return <CreateAccount />;

  return (
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
              <AvatarButton onPress={() => navigation.navigate("Account")} />
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
  );
};
