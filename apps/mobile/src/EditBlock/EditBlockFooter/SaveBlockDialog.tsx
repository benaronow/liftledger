import {
  useBlock,
  useMe,
  useStartBlock,
  useUpdateUserBlock,
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

export const SaveBlockDialog = ({ open, onClose }: Props) => {
  const { colors } = useTheme();
  const navigation = useNavigation<TabNav<"EditBlock">>();
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerStartBlock, isMutating: starting } = useStartBlock();
  const { trigger: triggerUpdateUserBlock, isMutating: updating } =
    useUpdateUserBlock();
  const saving = starting || updating;
  const { showSnackbar } = useSnackbar();

  const {
    templateBlock,
    setTemplateBlock,
    unsetTemplateBlock,
    setEditingWeekIdx,
  } = useTemplate();

  const handleSave = async () => {
    if (!curUser?._id) return;

    try {
      if (curBlock) {
        const res = await triggerUpdateUserBlock({
          userId: curUser._id,
          block: templateBlock,
        });
        // The block id is unchanged, so this tab stays mounted (no remount).
        // Sync the editor to the server's saved copy rather than blanking it —
        // web got this free by unmounting the route on navigate.
        if (res?.block) {
          setTemplateBlock(res.block);
          setEditingWeekIdx(res.block.curWeekIdx ?? 0);
        }
      } else {
        // Starting a block sets curUser.curBlock, which changes the screen's
        // remount key and re-reads the new block, so just clear local state.
        await triggerStartBlock({ userId: curUser._id, block: templateBlock });
        unsetTemplateBlock();
        setEditingWeekIdx(0);
      }

      // Close the dialog ourselves — its Modal would otherwise stay up over the
      // Dashboard we're about to navigate to.
      onClose();
      // Drop any lingering ?duplicateFrom so a later visit starts from curBlock.
      navigation.setParams({ duplicateFrom: undefined });
      navigation.navigate("Dashboard");
    } catch {
      showSnackbar("Error saving block. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Save Block"
      onConfirm={handleSave}
      confirming={saving}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: colors.text, fontSize: FONT.base }}>
          Are you sure you want to save this block?
        </Text>
        <Text
          style={{ color: colors.text, fontSize: FONT.base, fontWeight: "700" }}
        >
          {curBlock
            ? "This will overwrite your current block."
            : "This will become your active training block."}
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
