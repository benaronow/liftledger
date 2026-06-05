import { Ionicons } from "@expo/vector-icons";
import { useMe } from "@liftledger/api-client";
import { DARK_COLORS } from "@liftledger/shared";
import { useMemo } from "react";
import { Image, ScrollView, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { ActionButton } from "../components/ActionButton";
import { LogoSpinner } from "../components/LogoSpinner";
import { useTheme } from "../providers/ThemeProvider";
import { RADIUS, SPACING } from "../theme";
import { DangerZone } from "./DangerZone";
import { EmailInput } from "./EmailInput";
import { NameInput } from "./NameInput";
import { ResetPasswordButton } from "./ResetPasswordButton";

export const Profile = () => {
  const { user: auth0User, clearSession } = useAuth0();
  const { data: curUser } = useMe();
  const { colors } = useTheme();

  // Database-connection users (auth0|…) can edit email + reset password; social
  // logins manage those upstream.
  const isConnectionUser = useMemo(
    () => auth0User?.sub?.startsWith("auth0|") ?? false,
    [auth0User?.sub],
  );

  if (!curUser) return <LogoSpinner />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        alignItems: "center",
        gap: SPACING.md,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          paddingVertical: SPACING.md,
        }}
      >
        {auth0User?.picture && (
          <Image
            source={{ uri: auth0User.picture }}
            style={{
              height: 80,
              width: 80,
              borderRadius: 40,
              borderWidth: 3,
              borderColor: "white",
            }}
          />
        )}
      </View>

      <View
        style={{
          width: "100%",
          borderRadius: RADIUS.md,
          gap: SPACING.md,
          padding: SPACING.md,
          backgroundColor: colors.dark,
        }}
      >
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
            <Ionicons name="log-out-outline" size={22} color={DARK_COLORS.danger} />
          }
          variant="dangerInverted"
          onPress={() => clearSession()}
          // Buttons have no top label like the fields above, so add matching
          // spacing to keep the card evenly spaced (web's mt-3).
          style={{ marginTop: SPACING.lg }}
        />
      </View>

      <DangerZone />
    </ScrollView>
  );
};
