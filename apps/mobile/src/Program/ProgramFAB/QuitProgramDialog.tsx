import { useMe, useQuitProgram } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Text, useTheme } from "../../paper";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { TabNav } from "../../RootNavigator/types";
import { FONT } from "../../theme";
import { useProgramTransition } from "../ProgramTransition";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const QuitProgramDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();
  const navigation = useNavigation<TabNav<"Program">>();
  const { data: curUser } = useMe();
  const { trigger: triggerQuitProgram, isMutating: quitting } = useQuitProgram();
  const { unsetTemplateProgram, setEditingWeekIdx } = useTemplate();
  const { setTransitioning } = useProgramTransition();
  const [error, setError] = useState("");

  const handleQuit = async () => {
    if (!curUser?._id) return;
    setError("");
    // Cover the editor so the emptied template doesn't flash before we navigate
    // away. Reset on failure since we stay on the Program screen.
    setTransitioning(true);
    try {
      await triggerQuitProgram(curUser._id);
      unsetTemplateProgram();
      setEditingWeekIdx(0);
      onClose();
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch (e: unknown) {
      setTransitioning(false);
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
      description="Are you sure you want to quit this program?"
      emphasis="The program will be saved to your history with the weeks completed so far."
    >
      {!!error && (
        <Text style={{ color: colors.danger, fontSize: FONT.sm }}>{error}</Text>
      )}
    </ConfirmationDialog>
  );
};
