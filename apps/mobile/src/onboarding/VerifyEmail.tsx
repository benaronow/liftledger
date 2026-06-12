import { useCallback, useState } from "react";
import { View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { useResendVerification } from "@liftledger/api-client";
import { Button, Text, useTheme } from "../paper";
import { SPACING } from "../theme";
import { useSnackbar } from "../providers/SnackbarProvider";
import { useLogout } from "../RootNavigator/AuthenticatedRouter/useLogout";

interface Props {
  // Re-fetches the live Auth0 profile; the router re-renders once verified.
  onRefresh: () => Promise<unknown>;
}

export const VerifyEmail = ({ onRefresh }: Props) => {
  const { user } = useAuth0();
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const logout = useLogout();
  const { trigger: resend, isMutating: resending } = useResendVerification();
  const [refreshing, setRefreshing] = useState(false);

  const handleResend = useCallback(async () => {
    try {
      await resend();
      showSnackbar("Verification email sent.", "success");
    } catch {
      showSnackbar("Couldn't send the email. Try again shortly.", "error");
    }
  }, [resend, showSnackbar]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const profile = (await onRefresh()) as
        | { emailVerified?: boolean }
        | undefined;
      // If the router didn't already swap us off this screen, the email still
      // isn't verified on Auth0's side.
      if (!profile?.emailVerified)
        showSnackbar("Not verified yet — check your inbox.", "error");
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, showSnackbar]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.xl,
        padding: SPACING.xl,
        backgroundColor: colors.container,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}>
        Verify your email
      </Text>
      <View style={{ alignItems: "center", gap: SPACING.xs }}>
        <Text style={{ textAlign: "center", color: colors.textDisabled }}>
          We sent a verification link to
        </Text>
        <Text
          style={{ textAlign: "center", fontWeight: "600", color: colors.text }}
        >
          {user?.email}
        </Text>
        <Text style={{ textAlign: "center", color: colors.textDisabled }}>
          Open it, then tap the button below.
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={handleRefresh}
        loading={refreshing}
        disabled={refreshing}
      >
        {"I've verified my email"}
      </Button>
      <Button
        mode="text"
        onPress={handleResend}
        loading={resending}
        disabled={resending}
        labelStyle={{ marginVertical: 0 }}
      >
        Resend verification email
      </Button>
      <Button
        mode="text"
        textColor={colors.danger}
        onPress={logout}
        compact
        labelStyle={{ marginVertical: 0 }}
      >
        Log out
      </Button>
    </View>
  );
};
