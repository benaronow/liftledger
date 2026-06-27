import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth0 } from "react-native-auth0";
import { useAuth0Profile, useMe } from "@liftledger/api-client";
import { useTheme } from "../../paper";
import { AvatarButton } from "./AvatarButton";
import { ConnectionError } from "./ConnectionError";
import { LogoutButton } from "./LogoutButton";
import { LogoSpinner } from "../../components/LogoSpinner";
import { Timer } from "../../components/Timer";
import { Account } from "../../Account";
import { useThemePreference } from "../../providers/ThemeProvider";
import { CompleteDay } from "../../CompleteDay";
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
  const { data: profile, mutate: refreshProfile } =
    useAuth0Profile(!tokenVerified);
  const emailVerified = tokenVerified || !!profile?.emailVerified;

  const {
    data: curUser,
    isLoading: userLoading,
    error: userError,
    mutate: refreshMe,
  } = useMe(emailVerified);

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
          // Disable swipe-to-go-back: a horizontal drag on the progress chart
          // (gifted-charts pointer) otherwise gets grabbed by the pop gesture and
          // slides back to the dashboard. The header back button still works.
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
      <Timer />
    </>
  );
};
