import { Day } from "@liftledger/shared";
import { MdArrowBackIosNew, MdControlPointDuplicate } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useMe, useProgram } from "@liftledger/api-client";
import { Info, InfoAction } from "../Info";
import { useMemo } from "react";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  day: Day;
  dIdx: number;
  hasErrors: boolean;
  onRequestDelete: (dIdx: number) => void;
}

export const DayInfo = ({ day, dIdx, hasErrors, onRequestDelete }: Props) => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const {
    templateProgram,
    setTemplateProgram,
    editingWeekIdx,
    setEditingDayIdx,
  } = useTemplate();

  const handleMoveDay = (day: Day, dayIdx: number, type: "up" | "down") => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setTemplateProgram({
        ...templateProgram,
        weeks: templateProgram.weeks.map((week, idx) =>
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
      ...templateProgram.weeks[templateProgram.weeks.length - 1][dayIdx],
      name: `${templateProgram.weeks[0][dayIdx].name} (copy)`,
      completedDate: undefined,
    };

    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, idx) =>
        idx === editingWeekIdx ? week.toSpliced(dayIdx + 1, 0, day) : week,
      ),
    });
  };

  const infoActions: InfoAction[] = [
    {
      icon: (
        <MdArrowBackIosNew size={24} style={{ transform: "rotate(90deg)" }} />
      ),
      disabled: dIdx === curProgram?.curDayIdx || dIdx === 0,
      onClick: () => handleMoveDay(day, dIdx, "up"),
      variant: "primary",
    },
    {
      icon: (
        <MdArrowBackIosNew size={24} style={{ transform: "rotate(270deg)" }} />
      ),
      disabled: dIdx === templateProgram.weeks[editingWeekIdx].length - 1,
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
      icon: <MdControlPointDuplicate size={24} />,
      disabled: templateProgram.weeks[editingWeekIdx].length > 6,
      onClick: () => handleDuplicateDay(dIdx),
      variant: "primary",
    },
    {
      icon: <FaTrash fontSize="medium" />,
      disabled: templateProgram.weeks[editingWeekIdx].length === 1,
      onClick: () => onRequestDelete(dIdx),
      variant: "danger",
    },
  ];

  const disabledMessage = useMemo(() => {
    const isDisabled = curProgram ? curProgram?.curDayIdx > dIdx : false;
    return isDisabled
      ? "Day complete, cannot be edited or moved until next week."
      : "";
  }, [curProgram, dIdx]);

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
      {templateProgram.weeks[editingWeekIdx][dIdx].exercises.some(
        (e) => e.name && e.apparatus && e.sets.length,
      ) &&
        templateProgram.weeks[editingWeekIdx][dIdx].exercises
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
