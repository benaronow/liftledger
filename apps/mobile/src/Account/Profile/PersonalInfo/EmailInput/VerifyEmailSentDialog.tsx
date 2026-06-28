import { View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { useState } from "react";
import { Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../../components/ConfirmationDialog";
import { FONT, SPACING } from "../../../../theme";

interface Props {
  open: boolean;
  email: string;
}

export const VerifyEmailSentDialog = ({ open, email }: Props) => {
  const { colors } = useTheme();
  const { clearSession } = useAuth0();
  const [isClearing, setIsClearing] = useState(false);

  return (
    <ConfirmationDialog
      open={open}
      onClose={() => {}}
      title="Verify your new email"
      icon="email-check-outline"
      onConfirm={() => {
        clearSession();
        setIsClearing(true);
      }}
      confirming={isClearing}
      action="Log Out"
    >
      <View style={{ gap: SPACING.sm }}>
        <Text style={{ color: colors.onSurface, fontSize: FONT.base }}>
          We sent a verification link to{" "}
          <Text style={{ fontWeight: "700" }}>{email}</Text>.
        </Text>
        <Text style={{ color: colors.onSurface, fontSize: FONT.base }}>
          You&apos;ll need to verify it and sign back in before continuing.
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
