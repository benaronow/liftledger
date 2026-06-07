import { useRequestPasswordReset } from "@liftledger/api-client";
import { AxiosError } from "axios";
import { View } from "react-native";
import { Text, useTheme } from "../../../../paper";
import { ConfirmationDialog } from "../../../../components/ConfirmationDialog";
import { useSnackbar } from "../../../../providers/SnackbarProvider";
import { FONT, SPACING } from "../../../../theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();
  const { trigger: requestPasswordReset, isMutating: sending } =
    useRequestPasswordReset();
  const { showSnackbar } = useSnackbar();

  const handleSend = async () => {
    try {
      await requestPasswordReset();
      showSnackbar("Password reset email sent", "success");
    } catch (e: unknown) {
      const message = (e as AxiosError<{ error?: string }>)?.response?.data
        ?.error;
      showSnackbar(message ?? "Failed to send reset email", "error");
    } finally {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Reset Password"
      onConfirm={handleSend}
      confirming={sending}
    >
      <View style={{ gap: SPACING.sm, width: "100%" }}>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
          }}
        >
          Send a password reset email to your inbox?
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
            fontWeight: "700",
          }}
        >
          You&apos;ll receive a link to set a new password.
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
