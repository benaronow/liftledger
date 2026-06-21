import { View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { Button, Text, useTheme } from "../paper";
import { env } from "../config/env";
import { FONT, RADIUS, SPACING } from "../theme";

export const Welcome = () => {
  const { authorize, loginWithPasswordRealm, isLoading, error } = useAuth0();
  const { colors } = useTheme();

  const onLogin = () =>
    authorize({
      audience: env.auth0Audience,
      scope: "openid profile email offline_access",
    });

  // Dev-build-only: non-interactive password-realm login for the dedicated E2E
  // user, so Maestro can authenticate without driving the Auth0 browser sheet.
  // Gated by __DEV__ (stripped from release builds) and a configured E2E email,
  // so it never renders for real users.
  const showE2eLogin = __DEV__ && !!env.e2eEmail;
  const onE2eLogin = () =>
    loginWithPasswordRealm({
      username: env.e2eEmail,
      password: env.e2ePassword,
      realm: "Username-Password-Authentication",
      audience: env.auth0Audience,
      scope: "openid profile email offline_access",
    });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.xl,
        padding: SPACING.xl,
      }}
    >=
      <Text style={{ fontSize: 32, fontWeight: "700" }}>LiftLedger</Text>
      <Button
        mode="contained"
        onPress={onLogin}
        loading={isLoading}
        disabled={isLoading}
        style={{ minWidth: 180, borderRadius: RADIUS.md }}
        contentStyle={{ paddingVertical: SPACING.xs }}
        labelStyle={{ fontSize: FONT.base, fontWeight: "600" }}
      >
        Log in
      </Button>
      {showE2eLogin && (
        <Button
          mode="outlined"
          onPress={onE2eLogin}
          disabled={isLoading}
          style={{ minWidth: 180, borderRadius: RADIUS.md }}
          contentStyle={{ paddingVertical: SPACING.xs }}
          labelStyle={{ fontSize: FONT.base, fontWeight: "600" }}
        >
          E2E Sign In
        </Button>
      )}
      {error && (
        <Text style={{ color: colors.danger, textAlign: "center" }}>
          {error.message}
        </Text>
      )}
    </View>
  );
};
