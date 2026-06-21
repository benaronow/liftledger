import { useDeleteMe, useMe } from "@liftledger/api-client";
import { useState } from "react";
import { View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { Text, useTheme } from "../../../paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { FONT, SPACING } from "../../../theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DeleteAccountDialog = ({ open, onClose }: Props) => {
  const { clearSession } = useAuth0();
  const { data: curUser } = useMe();
  const { trigger: triggerDeleteMe, isMutating: deleting } = useDeleteMe();
  const [error, setError] = useState("");
  const { colors } = useTheme();

  const handleDelete = async () => {
    if (!curUser?._id) {
      setError("User not found");
      return;
    }
    setError("");
    try {
      await triggerDeleteMe();
      await clearSession();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to delete account");
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Delete Account"
      icon="alert"
      destructive
      onConfirm={handleDelete}
      confirming={deleting}
    >
      <View style={{ gap: SPACING.sm, width: "100%" }}>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
          }}
        >
          Are you sure you want to delete your account?
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
            fontWeight: "700",
          }}
        >
          This action is permanent and cannot be undone. All your data will be
          lost.
        </Text>
        {error !== "" && (
          <Text style={{ color: colors.danger, fontSize: FONT.sm }}>
            {error}
          </Text>
        )}
      </View>
    </ConfirmationDialog>
  );
};
