import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useMe, useQuitBlock } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ActionDialog, DialogAction } from "../../components/ActionDialog";
import type { TabNav } from "../../navigation/types";
import { FONT, SPACING } from "../../theme";
import { useTemplate } from "./TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const QuitBlockDialog = ({ open, onClose }: Props) => {
  const navigation = useNavigation<TabNav<"EditBlock">>();
  const { data: curUser } = useMe();
  const { trigger: triggerQuitBlock, isMutating: quitting } = useQuitBlock();
  const { unsetTemplateBlock, setEditingWeekIdx } = useTemplate();
  const [error, setError] = useState("");

  const handleQuit = async () => {
    if (!curUser?._id) return;
    setError("");
    try {
      await triggerQuitBlock(curUser._id);
      unsetTemplateBlock();
      setEditingWeekIdx(0);
      onClose();
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to quit block");
    }
  };

  const actions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.danger} />,
      onPress: onClose,
      variant: "dangerInverted",
      disabled: quitting,
    },
    {
      icon: quitting ? (
        <ActivityIndicator color="white" />
      ) : (
        <Ionicons name="stop-circle" size={26} color="white" />
      ),
      onPress: handleQuit,
      variant: "danger",
      disabled: quitting,
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={onClose}
      title="Quit Block"
      actions={actions}
      saving={quitting}
    >
      <View style={styles.body}>
        <Text style={styles.text}>
          Are you sure you want to quit this block?
        </Text>
        <Text style={styles.bold}>
          The block will be saved to your history with the weeks completed so
          far.
        </Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ActionDialog>
  );
};

const styles = StyleSheet.create({
  body: { width: "100%", gap: SPACING.md },
  text: { color: "white", fontSize: FONT.base },
  bold: { color: "white", fontSize: FONT.base, fontWeight: "700" },
  error: { color: COLORS.danger, fontSize: FONT.sm },
});
