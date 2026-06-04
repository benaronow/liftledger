import { Ionicons } from "@expo/vector-icons";
import { useMe } from "@liftledger/api-client";
import { COLORS } from "@liftledger/shared";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { ActionButton } from "../../components/ActionButton";
import { LogoSpinner } from "../../components/LogoSpinner";
import { FONT, RADIUS, SPACING } from "../../theme";
import { DangerZone } from "./DangerZone";
import { EmailInput } from "./EmailInput";
import { NameInput } from "./NameInput";
import { ResetPasswordButton } from "./ResetPasswordButton";

export const ProfileScreen = () => {
  const { user: auth0User, clearSession } = useAuth0();
  const { data: curUser } = useMe();

  // Database-connection users (auth0|…) can edit email + reset password; social
  // logins manage those upstream.
  const isConnectionUser = useMemo(
    () => auth0User?.sub?.startsWith("auth0|") ?? false,
    [auth0User?.sub],
  );

  if (!curUser) return <LogoSpinner />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      // Scroll a focused name/email field above the keyboard.
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.avatarBand}>
        {auth0User?.picture && (
          <Image
            source={{ uri: auth0User.picture }}
            style={styles.avatar}
          />
        )}
      </View>

      <View style={styles.card}>
        <NameInput
          field="firstName"
          label="First Name"
          placeholder="Enter first name..."
        />
        <NameInput
          field="lastName"
          label="Last Name"
          placeholder="Enter last name..."
        />
        <EmailInput isConnectionUser={isConnectionUser} />
        <ResetPasswordButton isConnectionUser={isConnectionUser} />
        <ActionButton
          label="Log Out"
          icon={
            <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          }
          variant="dangerInverted"
          onPress={() => clearSession()}
          // Buttons have no top label like the fields above, so add matching
          // spacing to keep the card evenly spaced (web's mt-3).
          style={styles.unlabeledButton}
        />
      </View>

      <DangerZone />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: {
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  avatarBand: {
    width: "100%",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
    padding: SPACING.md,
  },
  unlabeledButton: { marginTop: SPACING.lg },
});
