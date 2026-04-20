import { useMemo } from "react";
import { ActionsFooter, FooterAction } from "../components/ActionsFooter";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { LuWarehouse } from "react-icons/lu";
import { RiTimerLine } from "react-icons/ri";
import { useCompleteDay } from "./CompleteDayProvider";
import { BiSolidEdit } from "react-icons/bi";
import { useTimer } from "../layoutProviders/TimerProvider";

export const CompleteDayFooter = () => {
  const { timerEnd, setTimerDialogOpen } = useTimer();
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
        disabled: !!timerEnd,
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
      editing,
      setEditing,
      setFinishDayDialogOpen,
      isDayComplete,
      isDayStarted,
      setEditGymDialogOpen,
      timerEnd,
      setTimerDialogOpen,
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
    <ActionsFooter
      actions={editing ? editingFooterActions : defaultFooterActions}
    />
  );
};
