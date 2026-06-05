import { Ionicons } from "@expo/vector-icons";
import { Block, COLORS } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useBlock, useMe, useUpdateUserBlock } from "@liftledger/api-client";
import { ActionDialog, DialogAction } from "../../components/ActionDialog";
import type { RootStackParamList } from "../../navigation/types";
import { FONT, SPACING } from "../../theme";

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
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { trigger: triggerUpdateUserBlock } = useUpdateUserBlock();

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

    // Mask the screen first: once the save lands, the block advances to the next
    // day and would flash those exercises in behind the dialog. The mask (driven
    // by `finishing`) replaces the list with a spinner until we navigate away —
    // and keeps the Finish button in its loading state meanwhile.
    setFinishing(true);
    try {
      await triggerUpdateUserBlock({ userId: curUser._id, block: newBlock });
      onClose();
      navigation.navigate("Tabs", { screen: "Dashboard" });
    } catch {
      // Recover so the user isn't stranded on a spinner.
      setFinishing(false);
    }
  }, [
    curUser?._id,
    curBlock,
    triggerUpdateUserBlock,
    navigation,
    onClose,
    setFinishing,
  ]);

  const actions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.primary} />,
      onPress: onClose,
      variant: "primaryInverted",
      disabled: finishing,
    },
    {
      icon: finishing ? (
        <ActivityIndicator color="white" />
      ) : (
        <Ionicons name="checkmark" size={26} color="white" />
      ),
      onPress: handleFinishDay,
      variant: "primary",
      disabled: finishing,
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open
      onClose={onClose}
      title="Finish Day"
      actions={actions}
      saving={finishing}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: "white", fontSize: FONT.base }}>
          Are you sure you want to finish today&apos;s workout?
        </Text>
        <Text style={{ color: "white", fontSize: FONT.base, fontWeight: "700" }}>
          Once you finish, you can no longer edit exercises from this workout.
        </Text>
      </View>
    </ActionDialog>
  );
};
