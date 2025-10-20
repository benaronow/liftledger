import { Day } from "@/lib/types";
import { ArrowBackIosNew, ControlPointDuplicate } from "@mui/icons-material";
import { LabeledInput } from "../../components/LabeledInput";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { makeStyles } from "tss-react/mui";
import { ChangeEvent } from "react";
import { useBlock } from "@/app/providers/BlockProvider";
import { COLORS } from "@/lib/constants";

const useStyles = makeStyles()({
  day: {
    width: "100%",
    marginBottom: "15px",
    background: "#58585b",
    borderRadius: "5px",
    border: "solid 5px #58585b",
    boxShadow: "0px 5px 10px #131314",
  },
  dayInfo: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderRadius: "5px",
    alignItems: "center",
    background: "#131314",
    padding: "10px",
    margin: "0px 5px",
    gap: "10px",
  },
  sideButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },
  sideButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "35px",
    height: "35px",
    minHeight: "35px",
    border: "none",
    borderRadius: "5px",
    "&:hover": {
      cursor: "pointer",
    },
    fontSize: "20px",
  },
  buttonEnabled: {
    background: "#0096FF",
    color: "white",
  },
  buttonDisabled: {
    background: "#317baf",
    color: "#a7a7a7",
  },
  moveUpButton: {
    transform: "rotate(90deg)",
  },
  moveDownButton: {
    transform: "rotate(270deg)",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  valueButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    background: "transparent",
    color: "#0096FF",
    padding: "0px",
    border: "none",
    fontWeight: 600,
  },
});

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
  const { classes } = useStyles();
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
    <div className={`${classes.day} ${classes.entry}`}>
      <div className={classes.sideButtons}>
        <button
          className={`${classes.sideButton} ${
            dIdx === 0 ? classes.buttonDisabled : classes.buttonEnabled
          }`}
          onClick={() => handleMoveDay(day, dIdx, "up")}
        >
          <ArrowBackIosNew className={classes.moveUpButton} />
        </button>
        <button
          className={`${classes.sideButton} ${
            dIdx === templateBlock.weeks[editingWeekIdx].length - 1
              ? classes.buttonDisabled
              : classes.buttonEnabled
          }`}
          onClick={() => handleMoveDay(day, dIdx, "down")}
        >
          <ArrowBackIosNew className={classes.moveDownButton} />
        </button>
      </div>
      <div className={classes.dayInfo}>
        <LabeledInput
          label="Name: "
          textValue={day.name}
          onChangeText={(e: ChangeEvent<HTMLInputElement>) =>
            handleDayNameInput(e, dIdx)
          }
        />
        <div className={classes.entry}>
          <button
            className={classes.valueButton}
            onClick={() => handleEditDay(dIdx)}
          >
            <BiSolidEdit />
            {`${day.exercises[0].name ? "Edit" : "Add"} Exercises`}
            {hasErrors && <span style={{ color: COLORS.danger }}>!</span>}
          </button>
        </div>
      </div>
      <div className={classes.sideButtons}>
        <button
          className={`${classes.sideButton} ${
            templateBlock.weeks[editingWeekIdx].length === 1
              ? classes.buttonDisabled
              : classes.buttonEnabled
          }`}
          onClick={() => setDeletingIdx(dIdx)}
        >
          <FaTrash />
        </button>
        <button
          className={`${classes.sideButton} ${
            templateBlock.weeks[editingWeekIdx].length > 6
              ? classes.buttonDisabled
              : classes.buttonEnabled
          }`}
          onClick={() => handleDuplicateDay(dIdx)}
        >
          <ControlPointDuplicate />
        </button>
      </div>
    </div>
  );
};
