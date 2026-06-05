import { Ionicons } from "@expo/vector-icons";
import { useRequestPasswordReset } from "@liftledger/api-client";
import { COLORS } from "@liftledger/shared";
import { AxiosError } from "axios";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { variantColors } from "../components/ActionButton";
import { FONT, SPACING } from "../theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog = ({ open, onClose }: Props) => {
  const { trigger: requestPasswordReset, isMutating: sending } =
    useRequestPasswordReset();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setSent(false);
    setError("");
    onClose();
  };

  const handleSend = async () => {
    setError("");
    try {
      await requestPasswordReset();
      setSent(true);
    } catch (e: unknown) {
      const message = (e as AxiosError<{ error?: string }>)?.response?.data
        ?.error;
      setError(message ?? "Failed to send reset email");
    }
  };

  const actions: DialogAction[] = sent
    ? [
        {
          icon: (
            <Ionicons
              name="arrow-back"
              size={28}
              color={variantColors("primaryInverted", false).foreground}
            />
          ),
          onPress: handleClose,
          variant: "primaryInverted",
        },
      ]
    : [
        {
          icon: (
            <Ionicons
              name="arrow-back"
              size={28}
              color={variantColors("dangerInverted", sending).foreground}
            />
          ),
          onPress: handleClose,
          variant: "dangerInverted",
          disabled: sending,
        },
        {
          icon: sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Ionicons name="paper-plane" size={22} color="white" />
          ),
          onPress: handleSend,
          variant: "danger",
          disabled: sending,
        },
      ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={handleClose}
      title="Reset Password"
      actions={actions}
      saving={sending}
    >
      <View style={{ gap: SPACING.sm, width: "100%" }}>
        {sent ? (
          <Text
            style={{ color: "white", fontSize: FONT.base, fontWeight: "700" }}
          >
            A password reset email has been sent. Check your inbox to set a new
            password.
          </Text>
        ) : (
          <>
            <Text style={{ color: "white", fontSize: FONT.base }}>
              Send a password reset email to your inbox?
            </Text>
            <Text
              style={{ color: "white", fontSize: FONT.base, fontWeight: "700" }}
            >
              You&apos;ll receive a link to set a new password.
            </Text>
          </>
        )}
        {error !== "" && (
          <Text style={{ color: COLORS.danger, fontSize: FONT.sm }}>
            {error}
          </Text>
        )}
      </View>
    </ActionDialog>
  );
};
