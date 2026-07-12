import { Program } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import {
  useProgram,
  useMe,
  useUpdateUserProgram,
  useTimerEnd,
  useClearTimerEnd,
} from "@liftledger/api-client";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import type { RootStackParamList } from "../RootNavigator/types";
import { useSnackbar } from "../providers/SnackbarProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  finishing: boolean;
  setFinishing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FinishSessionDialog = ({
  open,
  onClose,
  finishing,
  setFinishing,
}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram();
  const { send: triggerUpdateUserProgram } = useUpdateUserProgram();
  const { data: timerEndData } = useTimerEnd();
  const { send: triggerClearTimerEnd } = useClearTimerEnd();
  const { showSnackbar } = useSnackbar();

  const handleFinishSession = useCallback(async () => {
    if (!curUser?._id || !curProgram) return;

    const newProgram: Program = {
      ...curProgram,
      rotations: curProgram.rotations.toSpliced(
        curProgram.curRotationIdx,
        1,
        curProgram.rotations[curProgram.curRotationIdx].toSpliced(
          curProgram.curSessionIdx,
          1,
          {
            ...curProgram.rotations[curProgram.curRotationIdx][
              curProgram.curSessionIdx
            ],
            completedDate: new Date(),
          },
        ),
      ),
    };

    setFinishing(true);
    try {
      await triggerUpdateUserProgram({
        program: newProgram,
      });
      if (timerEndData?.timerEnd) triggerClearTimerEnd().catch(() => {});
      onClose();
      navigation.navigate("Tabs", { screen: "Dashboard" }, { pop: true });
    } catch {
      showSnackbar("Failed to finish session. Please try again.");
    } finally {
      setFinishing(false);
    }
  }, [
    curUser?._id,
    curProgram,
    setFinishing,
    triggerUpdateUserProgram,
    timerEndData?.timerEnd,
    triggerClearTimerEnd,
    onClose,
    navigation,
    showSnackbar,
  ]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="Finish Session"
      onConfirm={handleFinishSession}
      confirming={finishing}
      description="Are you sure you want to finish today's workout?"
      emphasis="Once you finish, you can no longer edit exercises from this workout."
    />
  );
};
