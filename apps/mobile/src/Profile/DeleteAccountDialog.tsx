import { Ionicons } from "@expo/vector-icons";
import { useDeleteMe, useMe } from "@liftledger/api-client";
import { COLORS } from "@liftledger/shared";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { variantColors } from "../components/ActionButton";
import { ActionDialog, DialogAction } from "../components/ActionDialog";
import { FONT, SPACING } from "../theme";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const DeleteAccountDialog = ({ open, onClose }: Props) => {
  const { clearSession } = useAuth0();
  const { data: curUser } = useMe();
  const { trigger: triggerDeleteMe, isMutating: deleting } = useDeleteMe();
  const [error, setError] = useState("");

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

  const actions: DialogAction[] = [
    {
      icon: (
        <Ionicons
          name="arrow-back"
          size={28}
          color={variantColors("dangerInverted", deleting).foreground}
        />
      ),
      onPress: onClose,
      variant: "dangerInverted",
      disabled: deleting,
    },
    {
      icon: deleting ? (
        <ActivityIndicator color="white" />
      ) : (
        <Ionicons name="trash" size={24} color="white" />
      ),
      onPress: handleDelete,
      variant: "danger",
      disabled: deleting,
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Delete Account"
      actions={actions}
      saving={deleting}
    >
      <View style={{ gap: SPACING.sm, width: "100%" }}>
        <Text style={{ color: "white", fontSize: FONT.base }}>
          Are you sure you want to delete your account?
        </Text>
        <Text
          style={{ color: "white", fontSize: FONT.base, fontWeight: "700" }}
        >
          This action is permanent and cannot be undone. All your data will be
          lost.
        </Text>
        {error !== "" && (
          <Text style={{ color: COLORS.danger, fontSize: FONT.sm }}>
            {error}
          </Text>
        )}
      </View>
    </ActionDialog>
  );
};
