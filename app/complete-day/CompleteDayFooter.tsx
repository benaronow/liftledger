import { useCallback, useMemo } from "react";
import { ActionsFooter, FooterAction } from "../components/ActionsFooter";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { LuWarehouse } from "react-icons/lu";
import { RiTimerLine } from "react-icons/ri";
import { useBlock } from "../providers/BlockProvider";
import { Block } from "@/lib/types";
import { useCompletedExercises } from "../providers/CompletedExercisesProvider";
import { useUser } from "../providers/UserProvider";
import { useRouter } from "next/navigation";
import { useCompleteDay } from "./CompleteDayProvider";
import { BiSolidEdit } from "react-icons/bi";
import { useTimer } from "../providers/TimerProvider";

export const CompleteDayFooter = () => {
  const router = useRouter();
  const { curUser } = useUser();
  const { curBlock, updateBlock } = useBlock();
  const { timerEnd, setTimerDialogOpen } = useTimer();
  const { getCompletedExercises } = useCompletedExercises();
  const {
    editing,
    setEditing,
    setEditGymDialogOpen,
    isDayStarted,
    isDayComplete,
  } = useCompleteDay();

  const finishDay = useCallback(async () => {
    if (curBlock) {
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

      await updateBlock(newBlock);
      getCompletedExercises(curUser?._id || "");
      router.push("/dashboard");
    }
  }, [curBlock, updateBlock, router, curUser, getCompletedExercises]);

  const defaultFooterActions: FooterAction[] = useMemo(
    () => [
      {
        icon: <IoMdCheckmark style={{ fontSize: "20px" }} />,
        label: "Finish",
        onClick: finishDay,
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
      finishDay,
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
