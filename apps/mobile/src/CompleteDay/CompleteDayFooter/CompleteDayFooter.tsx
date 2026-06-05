import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActionsFooter, FooterAction } from "../../components/ActionsFooter";
import { useCurrentDay, useMe, useTimerEnd } from "@liftledger/api-client";
import { TimerSettingsDialog } from "./TimerSettingsDialog";
import { EditGymDialog } from "./EditGymDialog";
import { FinishDayDialog } from "./FinishDayDialog";

interface Props {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  isFinishing: boolean;
  setIsFinishing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CompleteDayFooter = ({
  isEditing,
  setIsEditing,
  isFinishing,
  setIsFinishing,
}: Props) => {
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);
  const [finishDayDialogOpen, setFinishDayDialogOpen] = useState(false);

  const { isDayStarted, isDayComplete } = useCurrentDay();

  const defaultFooterActions: FooterAction[] = useMemo(
    () => [
      {
        icon: <Ionicons name="checkmark" size={20} color="white" />,
        label: "Finish",
        onPress: () => setFinishDayDialogOpen(true),
        disabled: !isDayComplete,
        variant: "primary",
      },
      {
        icon: <Ionicons name="business" size={20} color="white" />,
        label: "Gym",
        onPress: () => setEditGymDialogOpen(true),
        disabled: isDayStarted,
        variant: "primary",
      },
      {
        icon: <Ionicons name="timer-outline" size={20} color="white" />,
        label: "Timer",
        onPress: () => setTimerDialogOpen(true),
        disabled: !!timerEndData?.timerEnd,
        variant: "primary",
      },
      {
        icon: <Ionicons name="create" size={20} color="white" />,
        label: "Edit",
        onPress: () => setIsEditing(true),
        variant: "primary",
      },
    ],
    [setIsEditing, isDayComplete, isDayStarted, timerEndData?.timerEnd],
  );

  const editingFooterActions: FooterAction[] = [
    {
      icon: <Ionicons name="close" size={20} color="white" />,
      label: "Stop Editing",
      onPress: () => setIsEditing(false),
      variant: "primary",
    },
  ];

  return (
    <>
      <ActionsFooter
        actions={isEditing ? editingFooterActions : defaultFooterActions}
        safeAreaBottom
      />
      <TimerSettingsDialog
        open={timerDialogOpen}
        onClose={() => setTimerDialogOpen(false)}
      />
      <EditGymDialog
        open={editGymDialogOpen}
        onClose={() => setEditGymDialogOpen(false)}
      />
      <FinishDayDialog
        open={finishDayDialogOpen}
        onClose={() => setFinishDayDialogOpen(false)}
        finishing={isFinishing}
        setFinishing={setIsFinishing}
      />
    </>
  );
};
