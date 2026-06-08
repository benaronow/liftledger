import {
  useProgram,
  useMe,
  useStartProgram,
  useUpdateUserProgram,
} from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { Text, useTheme } from "../../paper";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { TabNav } from "../../RootNavigator/types";
import { FONT, SPACING } from "../../theme";
import { useTemplate } from "../TemplateProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SaveProgramDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();
  const navigation = useNavigation<TabNav<"EditProgram">>();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerStartProgram, isMutating: starting } = useStartProgram();
  const { trigger: triggerUpdateUserProgram, isMutating: updating } =
    useUpdateUserProgram();
  const saving = starting || updating;
  const { showSnackbar } = useSnackbar();

  const {
    templateProgram,
    setTemplateProgram,
    unsetTemplateProgram,
    setEditingWeekIdx,
  } = useTemplate();

  const handleSave = async () => {
    if (!curUser?._id) return;

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

      // Close the dialog ourselves — its Modal would otherwise stay up over the
      // Dashboard we're about to navigate to.
      onClose();
      // Drop any lingering ?duplicateFrom so a later visit starts from curProgram.
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch {
      showSnackbar("Error saving program. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Save Program"
      onConfirm={handleSave}
      confirming={saving}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: colors.text, fontSize: FONT.base }}>
          Are you sure you want to save this program?
        </Text>
        <Text
          style={{ color: colors.text, fontSize: FONT.base, fontWeight: "700" }}
        >
          {curProgram
            ? "This will overwrite your current program."
            : "This will become your active training program."}
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
