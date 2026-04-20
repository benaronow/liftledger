import { Day } from "@/lib/types";
import { ArrowBackIosNew, ControlPointDuplicate } from "@mui/icons-material";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useBlock } from "@/app/layoutProviders/BlockProvider";
import { Info, InfoAction } from "../Info";
import { useMemo } from "react";
import { useEditBlock } from "../EditBlockProvider";

interface Props {
  day: Day;
  dIdx: number;
  hasErrors: boolean;
}

export const DayInfo = ({ day, dIdx, hasErrors }: Props) => {
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const { setEditingDayIdx, setDeletingDayIdx } = useEditBlock();

  const handleMoveDay = (day: Day, dayIdx: number, type: "up" | "down") => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, idx) =>
          idx === editingWeekIdx
            ? week
                .toSpliced(dayIdx, 1)
                .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, day)
            : week,
        ),
      });
    }
  };

  const handleDuplicateDay = (dayIdx: number) => {
    const day: Day = {
      ...templateBlock.weeks[templateBlock.weeks.length - 1][dayIdx],
      name: `${templateBlock.weeks[0][dayIdx].name} (copy)`,
      completedDate: undefined,
    };

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx ? week.toSpliced(dayIdx + 1, 0, day) : week,
      ),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(90deg)" }}
        />
      ),
      disabled: dIdx === curBlock?.curDayIdx || dIdx === 0,
      onClick: () => handleMoveDay(day, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: (
        <ArrowBackIosNew
          fontSize="medium"
          style={{ transform: "rotate(270deg)" }}
        />
      ),
      disabled: dIdx === templateBlock.weeks[editingWeekIdx].length - 1,
      onClick: () => handleMoveDay(day, dIdx, "down"),
      variant: "primary",
    },
    {
      icon: (
        <BiSolidEdit style={{ transform: "rotate(90deg)", fontSize: "22px" }} />
      ),
      onClick: () => setEditingDayIdx(dIdx),
      variant: "primary",
    },
    {
      icon: <ControlPointDuplicate fontSize="medium" />,
      disabled: templateBlock.weeks[editingWeekIdx].length > 6,
      onClick: () => handleDuplicateDay(dIdx),
      variant: "primary",
    },
    {
      icon: <FaTrash fontSize="medium" />,
      disabled: templateBlock.weeks[editingWeekIdx].length === 1,
      onClick: () => setDeletingDayIdx(dIdx),
      variant: "danger",
    },
  ];

  const disabledMessage = useMemo(() => {
    const isDisabled = curBlock ? curBlock?.curDayIdx > dIdx : false;
    return isDisabled
      ? "Day complete, cannot be edited or moved until next week."
      : "";
  }, [curBlock, dIdx]);

  return (
    <Info
      title={`Day ${dIdx + 1}`}
      actions={infoActions}
      disabledMessage={disabledMessage}
    >
      <strong className="text-white" style={{ fontSize: "14px" }}>
        {`Name: ${day.name} [${day.exercises.reduce(
          (acc, cur) =>
            acc + (cur.addedOn ? 0 : cur.sets.filter((s) => !s.addedOn).length),
          0,
        )}]`}
      </strong>
      {templateBlock.weeks[editingWeekIdx][dIdx].exercises.some(
        (e) => e.name && e.apparatus && e.sets.length,
      ) &&
        templateBlock.weeks[editingWeekIdx][dIdx].exercises
          .filter((ex) => !ex.addedOn)
          .map((ex, i) => (
            <span
              className="text-white"
              style={{ fontSize: "14px" }}
              key={ex._id}
            >{`${i + 1}. ${ex.name} [${
              ex.sets.filter((s) => !s.addedOn).length
            }]`}</span>
          ))}
      {hasErrors && (
        <strong className="text-danger" style={{ fontSize: "14px" }}>
          Must add at least one exercise.
        </strong>
      )}
    </Info>
  );
};
