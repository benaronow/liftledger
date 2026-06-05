import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { FONT, SPACING } from "../theme";

interface Props {
  open: boolean;
  email: string;
}

// After an email change, the user must verify the new address and re-auth — so
// the only way out of this dialog is to sign out (web parity).
export const VerifyEmailSentDialog = ({ open, email }: Props) => {
  const { clearSession } = useAuth0();

  const actions: DialogAction[] = [
    {
      icon: <Ionicons name="log-out-outline" size={22} color="white" />,
      onPress: () => clearSession(),
      variant: "primary",
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={() => {}}
      title="Verify your new email"
      actions={actions}
      saving
    >
      <View style={{ gap: SPACING.sm }}>
        <Text style={{ color: "white", fontSize: FONT.base }}>
          We sent a verification link to <Text style={{ fontWeight: "700" }}>{email}</Text>
          .
        </Text>
        <Text style={{ color: "white", fontSize: FONT.base }}>
          You&apos;ll need to verify it and sign back in before continuing.
        </Text>
      </View>
    </ActionDialog>
  );
};
