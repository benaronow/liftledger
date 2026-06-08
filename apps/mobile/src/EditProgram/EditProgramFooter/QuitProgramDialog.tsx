import { useMe, useQuitProgram } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native";
import { Text, useTheme } from "../../paper";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { TabNav } from "../../RootNavigator/types";
import { FONT, SPACING } from "../../theme";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const QuitProgramDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();
  const navigation = useNavigation<TabNav<"EditProgram">>();
  const { data: curUser } = useMe();
  const { trigger: triggerQuitProgram, isMutating: quitting } = useQuitProgram();
  const { unsetTemplateProgram, setEditingWeekIdx } = useTemplate();
  const [error, setError] = useState("");

  const handleQuit = async () => {
    if (!curUser?._id) return;
    setError("");
    try {
      await triggerQuitProgram(curUser._id);
      unsetTemplateProgram();
      setEditingWeekIdx(0);
      onClose();
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to quit program");
    }
  };

  if (!open) return null;

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Quit Program"
      onConfirm={handleQuit}
      confirming={quitting}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: colors.text, fontSize: FONT.base }}>
          Are you sure you want to quit this program?
        </Text>
        <Text
          style={{ color: colors.text, fontSize: FONT.base, fontWeight: "700" }}
        >
          The program will be saved to your history with the weeks completed so
          far.
        </Text>
        {!!error && (
          <Text style={{ color: colors.danger, fontSize: FONT.sm }}>
            {error}
          </Text>
        )}
      </View>
    </ConfirmationDialog>
  );
};
