import { Program } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { useProgram, useMe, useUpdateUserProgram } from "@liftledger/api-client";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import type { RootStackParamList } from "../RootNavigator/types";
import { useSnackbar } from "../providers/SnackbarProvider";

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
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { trigger: triggerUpdateUserProgram } = useUpdateUserProgram();
  const { showSnackbar } = useSnackbar();

  const handleFinishDay = useCallback(async () => {
    if (!curUser?._id || !curProgram) return;

    const newProgram: Program = {
      ...curProgram,
      weeks: curProgram.weeks.toSpliced(
        curProgram.curWeekIdx,
        1,
        curProgram.weeks[curProgram.curWeekIdx].toSpliced(curProgram.curDayIdx, 1, {
          ...curProgram.weeks[curProgram.curWeekIdx][curProgram.curDayIdx],
          completedDate: new Date(),
        }),
      ),
    };

    setFinishing(true);
    try {
      await triggerUpdateUserProgram({ userId: curUser._id, program: newProgram });
      onClose();
      // `pop: true` returns to the existing Tabs screen instead of pushing a new
      // one on top of CompleteDay (RN7 navigate no longer pops back by default).
      navigation.navigate("Tabs", { screen: "Dashboard" }, { pop: true });
    } catch {
      showSnackbar("Failed to finish day. Please try again.");
    } finally {
      setFinishing(false);
    }
  }, [
    curUser?._id,
    curProgram,
    setFinishing,
    triggerUpdateUserProgram,
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
      description="Are you sure you want to finish today's workout?"
      emphasis="Once you finish, you can no longer edit exercises from this workout."
    />
  );
};
