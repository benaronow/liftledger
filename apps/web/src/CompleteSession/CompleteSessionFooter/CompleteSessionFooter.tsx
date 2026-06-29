import { useMemo, useState } from "react";
import { ActionsFooter, FooterAction } from "@/components/ActionsFooter";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { LuWarehouse } from "react-icons/lu";
import { RiTimerLine } from "react-icons/ri";
import { BiSolidEdit } from "react-icons/bi";
import { useCurrentSession, useMe, useTimerEnd } from "@liftledger/api-client";
import { TimerSettingsDialog } from "./TimerSettingsDialog";
import { EditGymDialog } from "./EditGymDialog";
import { FinishSessionDialog } from "./FinishSessionDialog";

interface Props {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CompleteSessionFooter = ({ isEditing, setIsEditing }: Props) => {
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);
  const [finishSessionDialogOpen, setFinishSessionDialogOpen] = useState(false);

  const { isSessionStarted, isSessionComplete } = useCurrentSession();

  const defaultFooterActions: FooterAction[] = useMemo(
    () => [
      {
        icon: <IoMdCheckmark style={{ fontSize: "20px" }} />,
        label: "Finish",
        onClick: () => setFinishSessionDialogOpen(true),
        disabled: !isSessionComplete,
        variant: "primary",
      },
      {
        icon: <LuWarehouse fontSize={20} />,
        label: "Gym",
        onClick: () => setEditGymDialogOpen(true),
        disabled: isSessionStarted,
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
    [setIsEditing, isSessionComplete, isSessionStarted, timerEndData?.timerEnd],
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
      <FinishSessionDialog
        open={finishSessionDialogOpen}
        onClose={() => setFinishSessionDialogOpen(false)}
      />
    </>
  );
};
