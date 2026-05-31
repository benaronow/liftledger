import { useMemo, useState } from "react";
import { ActionsFooter, FooterAction } from "@/components/ActionsFooter";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { LuWarehouse } from "react-icons/lu";
import { RiTimerLine } from "react-icons/ri";
import { useCompleteDay } from "./CompleteDayProvider";
import { BiSolidEdit } from "react-icons/bi";
import { useMe, useTimerEnd } from "@liftledger/api-client";
import { TimerSettingsDialog } from "@/components/TimerSettingsDialog";

export const CompleteDayFooter = () => {
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);

  const {
    editing,
    setEditing,
    setEditGymDialogOpen,
    setFinishDayDialogOpen,
    isDayStarted,
    isDayComplete,
  } = useCompleteDay();

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
        onClick: () => setEditing(true),
        variant: "primary",
      },
    ],
    [
      setEditing,
      setFinishDayDialogOpen,
      isDayComplete,
      isDayStarted,
      setEditGymDialogOpen,
      timerEndData?.timerEnd,
    ],
  );

  const editingFooterActions: FooterAction[] = [
    {
      icon: <IoMdClose />,
      label: "Stop Editing",
      onClick: () => setEditing(false),
      variant: "primary",
    },
  ];

  return (
    <>
      <ActionsFooter
        actions={editing ? editingFooterActions : defaultFooterActions}
      />
      <TimerSettingsDialog
        open={timerDialogOpen}
        onClose={() => setTimerDialogOpen(false)}
      />
    </>
  );
};
