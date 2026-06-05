import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { SPACING } from "../theme";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

interface Props {
  isConnectionUser: boolean;
}

export const ResetPasswordButton = ({ isConnectionUser }: Props) => {
  const [open, setOpen] = useState(false);

  // Password reset only applies to database-connection users.
  if (!isConnectionUser) return null;

  return (
    <>
      <ActionButton
        label="Reset Password"
        icon={<Ionicons name="lock-closed-outline" size={22} color={COLORS.danger} />}
        variant="dangerInverted"
        onPress={() => setOpen(true)}
        // No top label like the fields above — match their spacing (web's mt-3).
        style={{ marginTop: SPACING.lg }}
      />
      <ResetPasswordDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
