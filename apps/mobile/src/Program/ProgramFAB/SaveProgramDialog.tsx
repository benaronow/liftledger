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
  const { trigger: triggerStartProgram, isMutating: starting } =
    useStartProgram();
  const { trigger: triggerUpdateUserProgram, isMutating: updating } =
    useUpdateUserProgram();
  const saving = starting || updating;
  const { showSnackbar } = useSnackbar();
  const { setTransitioning } = useProgramTransition();

  const {
    templateProgram,
    commitBaseline,
    unsetTemplateProgram,
    setEditingRotationIdx,
  } = useTemplate();

  const handleSave = async () => {
    if (!curUser?._id) return;

    setTransitioning(true);
    onClose();
    try {
      if (curProgram) {
        const res = await triggerUpdateUserProgram({
          userId: curUser._id,
          program: templateProgram,
        });
        if (res?.program) {
          commitBaseline(res.program);
          setEditingRotationIdx(res.program.curRotationIdx ?? 0);
        }
      } else {
        await triggerStartProgram({
          userId: curUser._id,
          program: templateProgram,
        });
        unsetTemplateProgram();
        setEditingRotationIdx(0);
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
