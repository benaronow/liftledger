import { useMemo, useState } from "react";
import { ActionsFooter, FooterAction } from "@/components/ActionsFooter";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { LuWarehouse } from "react-icons/lu";
import { RiTimerLine } from "react-icons/ri";
import { BiSolidEdit } from "react-icons/bi";
import { useCurrentDay, useMe, useTimerEnd } from "@liftledger/api-client";
import { TimerSettingsDialog } from "./TimerSettingsDialog";
import { EditGymDialog } from "./EditGymDialog";
import { FinishDayDialog } from "./FinishDayDialog";

interface Props {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CompleteDayFooter = ({ isEditing, setIsEditing }: Props) => {
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);
  const [finishDayDialogOpen, setFinishDayDialogOpen] = useState(false);

  const { isDayStarted, isDayComplete } = useCurrentDay();

  const defaultFooterActions: FooterAction[] = useMemo(
    () => [
      {
        icon: <IoMdCheckmark style={{ fontSize: "20px" }} />,
        label: "Finish",
        onClick: () => setFinishDayDialogOpen(true),
        disabled: !isDayComplete,
        variant: "primary",
      },
      {
        icon: <LuWarehouse fontSize={20} />,
        label: "Gym",
        onClick: () => setEditGymDialogOpen(true),
        disabled: isDayStarted,
        variant: "primary",
      },
      {
        icon: <RiTimerLine fontSize={20} />,
        label: "Timer",
        onClick: () => setTimerDialogOpen(true),
        disabled: !!timerEndData?.timerEnd,
        variant: "primary",
      },
      {
        icon: <BiSolidEdit />,
        label: "Edit",
        onClick: () => setIsEditing(true),
        variant: "primary",
      },
    ],
    [setIsEditing, isDayComplete, isDayStarted, timerEndData?.timerEnd],
  );

  const editingFooterActions: FooterAction[] = [
    {
      icon: <IoMdClose />,
      label: "Stop Editing",
      onClick: () => setIsEditing(false),
      variant: "primary",
    },
  ];

  return (
    <>
      <ActionsFooter
        actions={isEditing ? editingFooterActions : defaultFooterActions}
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
      />
    </>
  );
};
