import { View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { Button, Text, useTheme } from "../paper";
import { env } from "../config/env";
import { FONT, RADIUS, SPACING } from "../theme";

export const Welcome = () => {
  const { authorize, isLoading, error } = useAuth0();
  const { colors } = useTheme();

  const onLogin = () =>
    authorize({
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
    >
      {/* One-off brand wordmark — larger than any FONT token by design. */}
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
      {error && (
        <Text style={{ color: colors.danger, textAlign: "center" }}>
          {error.message}
        </Text>
      )}
    </View>
  );
};
