import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { useAuth0Profile, useMe, useTimerEnd } from "@liftledger/api-client";
import { useTheme } from "react-native-paper";
import { AvatarButton } from "./AvatarButton";
import { ConnectionError } from "./ConnectionError";
import { LogoutButton } from "./LogoutButton";
import { LogoSpinner } from "../../components/LogoSpinner";
import { HeaderTimer } from "./HeaderTimer";
import { TimerCountdownProvider } from "./TimerCountdownProvider";
import { Account } from "../../Account";
import { useThemePreference } from "../../providers/ThemeProvider";
import { CompleteSession } from "../../CompleteSession";
import { VerifyEmail } from "../../onboarding/VerifyEmail";
import { CreateAccount } from "../../onboarding/CreateAccount";
import { TabNavigator } from "../TabNavigator";
import type { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const tabTitle = (route: RouteProp<RootStackParamList, "Tabs">): string => {
  switch (getFocusedRouteNameFromRoute(route) ?? "Dashboard") {
    case "Progress":
      return "Progress";
    case "Program":
      return "Program";
    case "Dashboard":
    default:
      return "Home";
  }
};

export const AuthenticatedRouter = () => {
  const { user } = useAuth0();
  const { colors } = useTheme();
  const { scheme } = useThemePreference();

  const tokenVerified = user?.email_verified === true;
  const { data: profile, refresh: refreshProfile } =
    useAuth0Profile(!tokenVerified);
  const emailVerified = tokenVerified || !!profile?.emailVerified;

  const {
    data: curUser,
    isLoading: userLoading,
    error: userError,
    refresh: refreshMe,
  } = useMe(emailVerified);

  const { data: timerEndData } = useTimerEnd();
  const timerRunning = !!timerEndData?.timerEnd;

  const status = (userError as { response?: { status?: number } } | undefined)
    ?.response?.status;
  const accountMissing = status === 404;

  // User is authenticated but Auth0 token/profile have not loaded
  if (!tokenVerified && !profile) return <LogoSpinner />;

  // Auth0 profile loaded but email is not verified
  if (!emailVerified) return <VerifyEmail onRefresh={refreshProfile} />;

  // Verified Auth0 profile loaded but db user has not loaded
  if (userLoading && !curUser && !userError) return <LogoSpinner />;

  // Verified Auth0 profile loaded but db user has error
  if (userError && !accountMissing)
    return <ConnectionError onRetry={refreshMe} />;

  // Verified Auth0 profile loaded but db user doesn't exist
  if (!curUser) return <CreateAccount />;

  // Verified Auth0 profile and db user both loaded
  return (
    <TimerCountdownProvider>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primaryContainer },
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
            headerLeft: timerRunning ? () => <HeaderTimer /> : undefined,
            headerRight: () => (
              <AvatarButton onPress={() => navigation.navigate("Account")} />
            ),
          })}
        />
        <Stack.Screen
          name="CompleteSession"
          component={CompleteSession}
          options={{ title: "Workout", gestureEnabled: false }}
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
    </TimerCountdownProvider>
  );
};
