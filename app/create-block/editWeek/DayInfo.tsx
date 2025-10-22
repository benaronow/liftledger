import { Day } from "@/lib/types";
import { ArrowBackIosNew, ControlPointDuplicate } from "@mui/icons-material";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { useBlock } from "@/app/providers/BlockProvider";
import { COLORS } from "@/lib/constants";
import { ActionButton } from "@/app/components/ActionButton";

interface Props {
  day: Day;
  dIdx: number;
  setEditingDay: (day: number) => void;
  setDeletingIdx: React.Dispatch<React.SetStateAction<number | undefined>>;
  hasErrors: boolean;
}

export const DayInfo = ({
  day,
  dIdx,
  setEditingDay,
  setDeletingIdx,
  hasErrors,
}: Props) => {
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useBlock();

  const handleMoveDay = (day: Day, dayIdx: number, type: "up" | "down") => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, idx) =>
          idx === editingWeekIdx
            ? week
                .toSpliced(dayIdx, 1)
                .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, day)
            : week
        ),
      });
    }
  };

  const handleEditDay = (dayIdx: number) => {
    setEditingDay(dayIdx);
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
        idx === editingWeekIdx ? week.toSpliced(dayIdx + 1, 0, day) : week
      ),
    });
  };

  return (
    <div
      className="d-flex flex-column w-100 rounded overflow-hidden"
      style={{
        boxShadow: "0px 5px 10px #131314",
        marginBottom: "15px",
      }}
    >
      <div
        className="w-100 d-flex align-items-center justify-content-center p-1"
        style={{ background: COLORS.dark }}
      >
        <strong className="text-white fs-6">{`Day ${dIdx + 1}`}</strong>
      </div>
      <div
        className="d-flex flex-column w-100 align-items-start p-2 gap-2"
        style={{ background: COLORS.container }}
      >
        <strong className="text-white" style={{ fontSize: "14px" }}>
          {`Name: ${day.name}`}
        </strong>
        {templateBlock.weeks[editingWeekIdx][dIdx].exercises.some(
          (e) => e.name && e.apparatus && e.sets.length
        ) &&
          templateBlock.weeks[editingWeekIdx][dIdx].exercises.map((ex, i) => (
            <span
              className="text-white"
              style={{ fontSize: "14px" }}
              key={ex._id}
            >{`${i + 1}. ${ex.name}`}</span>
          ))}
        {hasErrors && (
          <strong className="text-danger" style={{ fontSize: "14px" }}>
            Must add at least one exercise.
          </strong>
        )}
      </div>
      <div
        className="w-100 d-flex align-items-center gap-2 p-2"
        style={{ background: COLORS.dark }}
      >
        <ActionButton
          className="w-100"
          icon={
            <ArrowBackIosNew
              fontSize="medium"
              style={{ transform: "rotate(90deg)" }}
            />
          }
          disabled={dIdx === 0}
          onClick={() => handleMoveDay(day, dIdx, "up")}
        />
        <ActionButton
          className="w-100"
          icon={
            <ArrowBackIosNew
              fontSize="medium"
              style={{ transform: "rotate(270deg)" }}
            />
          }
          disabled={dIdx === templateBlock.weeks[editingWeekIdx].length - 1}
          onClick={() => handleMoveDay(day, dIdx, "down")}
        />
        <ActionButton
          className="w-100"
          icon={
            <BiSolidEdit
              style={{ transform: "rotate(90deg)", fontSize: "22px" }}
            />
          }
          onClick={() => handleEditDay(dIdx)}
        />
        <ActionButton
          className="w-100"
          icon={<ControlPointDuplicate fontSize="medium" />}
          disabled={templateBlock.weeks[editingWeekIdx].length > 6}
          onClick={() => handleDuplicateDay(dIdx)}
        />
        <ActionButton
          className="w-100"
          icon={<FaTrash fontSize="medium" />}
          disabled={templateBlock.weeks[editingWeekIdx].length === 1}
          onClick={() => setDeletingIdx(dIdx)}
        />
      </div>
    </div>
  );
};
