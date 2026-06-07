import { View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { ActivityIndicator, Text, TouchableRipple, useTheme } from "../paper";
import { env } from "../config/env";

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
        gap: 24,
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "700" }}>LiftLedger</Text>
      <TouchableRipple
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          paddingHorizontal: 48,
          borderRadius: 8,
          minWidth: 180,
          alignItems: "center",
        }}
        onPress={onLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Log in
          </Text>
        )}
      </TouchableRipple>
      {error && (
        <Text style={{ color: colors.danger, textAlign: "center" }}>
          {error.message}
        </Text>
      )}
    </View>
  );
};
