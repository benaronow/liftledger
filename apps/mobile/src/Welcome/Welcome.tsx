import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { env } from "../config/env";

export const Welcome = () => {
  const { authorize, isLoading, error } = useAuth0();

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
      <Pressable
        style={{
          backgroundColor: "#0d6efd",
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
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Log in
          </Text>
        )}
      </Pressable>
      {error && (
        <Text style={{ color: "#dc3545", textAlign: "center" }}>
          {error.message}
        </Text>
      )}
    </View>
  );
};
