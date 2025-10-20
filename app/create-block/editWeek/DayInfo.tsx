import { Day } from "@/lib/types";
import { ArrowBackIosNew, ControlPointDuplicate } from "@mui/icons-material";
import { LabeledInput } from "../../components/LabeledInput";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent } from "react";
import { useBlock } from "@/app/providers/BlockProvider";
import { COLORS } from "@/lib/constants";

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

  const handleDayNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayIdx: number
  ) => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? week.map((day, idx) =>
              idx === dayIdx ? { ...day, name: e.target.value } : day
            )
          : week
      ),
    });
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
      className="d-flex align-items-center w-100 justify-content-center"
      style={{
        background: "#58585b",
        borderRadius: "5px",
        border: "solid 5px #58585b",
        boxShadow: "0px 5px 10px #131314",
        marginBottom: "15px",
      }}
    >
      <div
        className="d-flex flex-column align-items-center"
        style={{ gap: "5px" }}
      >
        <button
          className="d-flex justify-content-center align-items-center border-0"
          style={{
            width: "35px",
            height: "35px",
            minHeight: "35px",
            borderRadius: "5px",
            fontSize: "20px",
            background: dIdx === 0 ? "#317baf" : "#0096FF",
            color: dIdx === 0 ? "#a7a7a7" : "white",
            cursor: "pointer",
          }}
          onClick={() => handleMoveDay(day, dIdx, "up")}
        >
          <ArrowBackIosNew style={{ transform: "rotate(90deg)" }} />
        </button>
        <button
          className="d-flex justify-content-center align-items-center border-0"
          style={{
            width: "35px",
            height: "35px",
            minHeight: "35px",
            borderRadius: "5px",
            fontSize: "20px",
            background:
              dIdx === templateBlock.weeks[editingWeekIdx].length - 1
                ? "#317baf"
                : "#0096FF",
            color:
              dIdx === templateBlock.weeks[editingWeekIdx].length - 1
                ? "#a7a7a7"
                : "white",
            cursor: "pointer",
          }}
          onClick={() => handleMoveDay(day, dIdx, "down")}
        >
          <ArrowBackIosNew style={{ transform: "rotate(270deg)" }} />
        </button>
      </div>
      <div
        className="d-flex flex-column w-100 align-items-center"
        style={{
          background: "#131314",
          padding: "10px",
          borderRadius: "5px",
          margin: "0 5px",
          gap: "10px",
        }}
      >
        <LabeledInput
          label="Name: "
          textValue={day.name}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) =>
            handleDayNameInput(e, dIdx)
          }
        />
        <div className="d-flex align-items-center w-100 justify-content-center">
          <button
            className="d-flex align-items-center border-0"
            style={{
              gap: "5px",
              fontSize: "14px",
              background: "transparent",
              color: "#0096FF",
              padding: 0,
              fontWeight: 600,
            }}
            onClick={() => handleEditDay(dIdx)}
          >
            <BiSolidEdit />
            {`${day.exercises[0].name ? "Edit" : "Add"} Exercises`}
            {hasErrors && <span style={{ color: COLORS.danger }}>!</span>}
          </button>
        </div>
      </div>
      <div
        className="d-flex flex-column align-items-center"
        style={{ gap: "5px" }}
      >
        <button
          className="d-flex justify-content-center align-items-center border-0"
          style={{
            width: "35px",
            height: "35px",
            minHeight: "35px",
            borderRadius: "5px",
            fontSize: "20px",
            background:
              templateBlock.weeks[editingWeekIdx].length === 1
                ? "#317baf"
                : "#0096FF",
            color:
              templateBlock.weeks[editingWeekIdx].length === 1
                ? "#a7a7a7"
                : "white",
            cursor: "pointer",
          }}
          onClick={() => setDeletingIdx(dIdx)}
        >
          <FaTrash />
        </button>
        <button
          className="d-flex justify-content-center align-items-center border-0"
          style={{
            width: "35px",
            height: "35px",
            minHeight: "35px",
            borderRadius: "5px",
            fontSize: "20px",
            background:
              templateBlock.weeks[editingWeekIdx].length > 6
                ? "#317baf"
                : "#0096FF",
            color:
              templateBlock.weeks[editingWeekIdx].length > 6
                ? "#a7a7a7"
                : "white",
            cursor: "pointer",
          }}
          onClick={() => handleDuplicateDay(dIdx)}
        >
          <ControlPointDuplicate />
        </button>
      </div>
    </div>
  );
};
