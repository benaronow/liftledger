import { useQuitProgram } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { TabNav } from "../../RootNavigator/types";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const QuitProgramDialog = ({ open, onClose }: Props) => {
  const navigation = useNavigation<TabNav<"Program">>();
  const { send: triggerQuitProgram, isLoading: quitting } = useQuitProgram();
  const { unsetTemplateProgram, setEditingRotationIdx } = useTemplate();
  const { showSnackbar } = useSnackbar();

  const handleQuit = async () => {
    try {
      await triggerQuitProgram();
      unsetTemplateProgram();
      setEditingRotationIdx(0);

      onClose();
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch {
      showSnackbar("Failed to quit program.", "error");
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Quit Program"
      destructive
      onConfirm={handleQuit}
      confirming={quitting}
      description="Are you sure you want to quit this program?"
      emphasis="The program will be saved to your history with the rotations completed so far."
    />
  );
};
