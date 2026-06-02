import { useMe } from "@liftledger/api-client";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth0 } from "react-native-auth0";

export const DashboardScreen = () => {
  const { clearSession } = useAuth0();
  const { data: me, error, isLoading } = useMe();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Couldn't load your profile.</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Welcome{me?.firstName ? `, ${me.firstName}` : ""}
      </Text>
      <Text style={styles.detail}>{me?.email}</Text>
      <Text style={styles.detail}>{me?.blocks.length ?? 0} training blocks</Text>
      <Pressable style={styles.logout} onPress={() => clearSession()}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  heading: { fontSize: 28, fontWeight: "700" },
  detail: { fontSize: 16, color: "#444" },
  error: { fontSize: 16, fontWeight: "600", color: "#dc3545" },
  errorDetail: { fontSize: 12, color: "#888", textAlign: "center" },
  logout: {
    marginTop: 24,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0d6efd",
  },
  logoutText: { color: "#0d6efd", fontWeight: "600" },
});
