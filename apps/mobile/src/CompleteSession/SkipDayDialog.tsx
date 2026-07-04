import {
  Exercise,
  Program,
  buildProgramWithSessionExercises,
  isSameExercise,
} from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import {
  findLatestOccurrence,
  isExerciseComplete,
  useClearTimerEnd,
  useCompletedExercises,
  useCurrentSession,
  useMe,
  useProgram,
  useTimerEnd,
  useUpdateUserProgram,
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

export const SkipDayDialog = ({
  open,
  onClose,
  finishing,
  setFinishing,
}: Props) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { data: completedExercises } = useCompletedExercises(curUser?._id);
  const { trigger: triggerUpdateUserProgram } = useUpdateUserProgram();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const { trigger: triggerClearTimerEnd } = useClearTimerEnd();
  const { exercises } = useCurrentSession();
  const { showSnackbar } = useSnackbar();

  const handleSkipDay = useCallback(async () => {
    if (!curUser?._id || !curProgram) return;

    // Mark every not-yet-logged set across the day as skipped, mirroring how a
    // single set is skipped in SubmitSetDialog: fall back to the latest previous
    // occurrence's values when available.
    const updatedExercises: Exercise[] = exercises.map((exercise) => {
      if (isExerciseComplete(exercise)) return exercise;

      return {
        ...exercise,
        workingSets: exercise.workingSets.map((set, setIdx) => {
          if (set.completed || set.skipped) return set;

          const latestPreviousSet = findLatestOccurrence(
            completedExercises,
            (e) => isSameExercise(e, exercise) && !!e.workingSets[setIdx],
          )?.workingSets[setIdx];

          return {
            ...(latestPreviousSet ?? set),
            completed: false,
            skipped: true,
            addedOn: set.addedOn,
          };
        }),
      };
    });

    // Same as finishing: stamp the session complete so the server advances the
    // session/rotation on save.
    const withSkippedSets = buildProgramWithSessionExercises(
      curProgram,
      updatedExercises,
    );
    const curRotation = withSkippedSets.rotations[curProgram.curRotationIdx];
    const finishedProgram: Program = {
      ...withSkippedSets,
      rotations: withSkippedSets.rotations.toSpliced(
        curProgram.curRotationIdx,
        1,
        curRotation.toSpliced(curProgram.curSessionIdx, 1, {
          ...curRotation[curProgram.curSessionIdx],
          completedDate: new Date(),
        }),
      ),
    };

    setFinishing(true);
    try {
      await triggerUpdateUserProgram({
        userId: curUser._id,
        program: finishedProgram,
      });
      if (timerEndData?.timerEnd)
        triggerClearTimerEnd(curUser._id).catch(() => {});
      onClose();
      navigation.navigate("Tabs", { screen: "Dashboard" }, { pop: true });
    } catch {
      showSnackbar("Failed to skip the rest of the day. Please try again.");
    } finally {
      setFinishing(false);
    }
  }, [
    curUser?._id,
    curProgram,
    exercises,
    completedExercises,
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
      title="Skip Day"
      onConfirm={handleSkipDay}
      confirming={finishing}
      description="Are you sure you want to skip the rest of today's workout?"
      emphasis="Every remaining set will be marked as skipped and the session will be finished."
    />
  );
};
