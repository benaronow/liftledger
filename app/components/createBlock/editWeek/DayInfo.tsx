import {
  selectCurBlock,
  selectEditingBlock,
} from "@/lib/features/user/userSlice";
import { Block, Day } from "@/types";
import { ArrowBackIosNew, ControlPointDuplicate } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { LabeledInput } from "../../LabeledInput";
import { BiSolidEdit } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { makeStyles } from "tss-react/mui";
import { ChangeEvent } from "react";

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
  block: Block;
  setBlock: (block: Block) => void;
  setEditingDay: (day: number) => void;
  setDeletingIdx: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export const DayInfo = ({
  day,
  dIdx,
  block,
  setBlock,
  setEditingDay,
  setDeletingIdx,
}: Props) => {
  const { classes } = useStyles();
  const curBlock = useSelector(selectCurBlock);
  const editingBlock = useSelector(selectEditingBlock);
  const editingWeekIdx = editingBlock ? curBlock?.curWeekIdx || 0 : 0;

  const handleMoveDay = (day: Day, dayIdx: number, type: "up" | "down") => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setBlock({
        ...block,
        weeks: block.weeks.map((week, idx) =>
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
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
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
      ...block.weeks[block.weeks.length - 1][dayIdx],
      name: `${block.weeks[0][dayIdx].name} (copy)`,
      completedDate: undefined,
    };

    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
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
            dIdx === block.weeks[editingWeekIdx].length - 1
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
          </button>
        </div>
      </div>
      <div className={classes.sideButtons}>
        <button
          className={`${classes.sideButton} ${
            block.weeks[editingWeekIdx].length === 1
              ? classes.buttonDisabled
              : classes.buttonEnabled
          }`}
          onClick={() => setDeletingIdx(dIdx)}
        >
          <FaTrash />
        </button>
        <button
          className={`${classes.sideButton} ${
            block.weeks[editingWeekIdx].length > 6
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
