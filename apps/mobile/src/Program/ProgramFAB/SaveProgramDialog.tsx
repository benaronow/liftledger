import {
  useProgram,
  useMe,
  useStartProgram,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { TabNav } from "../../RootNavigator/types";
import { useProgramTransition } from "../ProgramTransition";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SaveProgramDialog = ({ open, onClose }: Props) => {
  const navigation = useNavigation<TabNav<"Program">>();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerStartProgram, isMutating: starting } = useStartProgram();
  const { trigger: triggerUpdateUserProgram, isMutating: updating } =
    useUpdateUserProgram();
  const saving = starting || updating;
  const { showSnackbar } = useSnackbar();
  const { setTransitioning } = useProgramTransition();

  const {
    templateProgram,
    setTemplateProgram,
    unsetTemplateProgram,
    setEditingWeekIdx,
  } = useTemplate();

  const handleSave = async () => {
    if (!curUser?._id) return;

    // Show the loading spinner and close the dialog right away so only the
    // spinner shows through the save. Reset on failure so we don't strand the
    // spinner over a screen we're staying on.
    setTransitioning(true);
    onClose();
    try {
      if (curProgram) {
        const res = await triggerUpdateUserProgram({
          userId: curUser._id,
          program: templateProgram,
        });
        // The program id is unchanged, so this tab stays mounted (no remount).
        // Sync the editor to the server's saved copy rather than blanking it —
        // web got this free by unmounting the route on navigate.
        if (res?.program) {
          setTemplateProgram(res.program);
          setEditingWeekIdx(res.program.curWeekIdx ?? 0);
        }
      } else {
        // Starting a program sets curUser.curProgram, which changes the screen's
        // remount key and re-reads the new program, so just clear local state.
        await triggerStartProgram({ userId: curUser._id, program: templateProgram });
        unsetTemplateProgram();
        setEditingWeekIdx(0);
      }

      // Drop any lingering ?duplicateFrom so a later visit starts from curProgram.
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch {
      setTransitioning(false);
      showSnackbar("Error saving program. Please try again.");
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Save Program"
      icon="content-save-outline"
      onConfirm={handleSave}
      confirming={saving}
      description="Are you sure you want to save this program?"
      emphasis={
        curProgram
          ? "This will overwrite your current program."
          : "This will become your active training program."
      }
    />
  );
};
