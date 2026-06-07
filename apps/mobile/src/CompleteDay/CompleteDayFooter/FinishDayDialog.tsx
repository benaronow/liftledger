import { Block } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { View } from "react-native";
import { Text, useTheme } from "../../paper";
import { useBlock, useMe, useUpdateUserBlock } from "@liftledger/api-client";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import type { RootStackParamList } from "../../RootNavigator/types";
import { FONT, SPACING } from "../../theme";
import { useSnackbar } from "../../providers/SnackbarProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  finishing: boolean;
  setFinishing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FinishDayDialog = ({
  open,
  onClose,
  finishing,
  setFinishing,
}: Props) => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock } = useUpdateUserBlock();
  const { showSnackbar } = useSnackbar();

  const handleFinishDay = useCallback(async () => {
    if (!curUser?._id || !curBlock) return;

    const newBlock: Block = {
      ...curBlock,
      weeks: curBlock.weeks.toSpliced(
        curBlock.curWeekIdx,
        1,
        curBlock.weeks[curBlock.curWeekIdx].toSpliced(curBlock.curDayIdx, 1, {
          ...curBlock.weeks[curBlock.curWeekIdx][curBlock.curDayIdx],
          completedDate: new Date(),
        }),
      ),
    };

    setFinishing(true);
    try {
      await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
      onClose();
      navigation.navigate("Tabs", { screen: "Dashboard" });
    } catch {
      showSnackbar("Failed to finish day. Please try again.");
    } finally {
      setFinishing(false);
    }
  }, [
    curUser?._id,
    curBlock,
    setFinishing,
    triggerUpdateUserBlock,
    onClose,
    navigation,
    showSnackbar,
  ]);

  if (!open) return null;

  return (
    <ConfirmationDialog
      open
      onClose={onClose}
      title="Finish Day"
      onConfirm={handleFinishDay}
      confirming={finishing}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
          }}
        >
          Are you sure you want to finish today&apos;s workout?
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: FONT.base,
            fontWeight: "700",
          }}
        >
          Once you finish, you can no longer edit exercises from this workout.
        </Text>
      </View>
    </ConfirmationDialog>
  );
};
