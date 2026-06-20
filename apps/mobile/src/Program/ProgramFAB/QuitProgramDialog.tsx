import { useMe, useQuitProgram } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { TabNav } from "../../RootNavigator/types";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { useProgramTransition } from "../ProgramTransition";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const QuitProgramDialog = ({ open, onClose }: Props) => {
  const navigation = useNavigation<TabNav<"Program">>();
  const { data: curUser } = useMe();
  const { trigger: triggerQuitProgram, isMutating: quitting } = useQuitProgram();
  const { unsetTemplateProgram, setEditingWeekIdx } = useTemplate();
  const { setTransitioning } = useProgramTransition();
  const { showSnackbar } = useSnackbar();

  const handleQuit = async () => {
    if (!curUser?._id) return;
    // Show the loading spinner and close the dialog right away so only the
    // spinner shows. Reset on failure since we stay on the Program screen.
    setTransitioning(true);
    onClose();
    try {
      await triggerQuitProgram(curUser._id);
      unsetTemplateProgram();
      setEditingWeekIdx(0);
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch (e: unknown) {
      setTransitioning(false);
      showSnackbar((e as Error).message || "Failed to quit program");
    }
  };

  if (!open) return null;

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Quit Program"
      icon="alert"
      destructive
      onConfirm={handleQuit}
      confirming={quitting}
      description="Are you sure you want to quit this program?"
      emphasis="The program will be saved to your history with the weeks completed so far."
    />
  );
};
