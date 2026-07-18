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
  const { data: curProgram } = useProgram();
  const { send: triggerStartProgram, isLoading: starting } = useStartProgram();
  const { send: triggerUpdateUserProgram, isLoading: updating } =
    useUpdateUserProgram();
  const saving = starting || updating;
  const { showSnackbar } = useSnackbar();
  const { setTransitioning } = useProgramTransition();

  const {
    templateProgram,
    rebaseTemplate,
    unsetTemplateProgram,
    setEditingRotationIdx,
  } = useTemplate();

  const handleSave = async () => {
    if (!curUser?._id) return;
    setTransitioning(true);

    try {
      if (curProgram) {
        const res = await triggerUpdateUserProgram({
          program: templateProgram,
        });
        if (res?.program) {
          rebaseTemplate(res.program);
          setEditingRotationIdx(res.program.curRotationIdx ?? 0);
        }
      } else {
        await triggerStartProgram({
          program: templateProgram,
        });
        unsetTemplateProgram();
        setEditingRotationIdx(0);
      }

      onClose();
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch {
      setTransitioning(false);
      showSnackbar("Error saving program. Please try again.", "error");
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
