import {
  blockOp,
  selectCurBlock,
  selectEditingBlock,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, WeightType } from "@/types";
import {
  ArrowBackIosNew,
  ControlPointDuplicate,
  DeleteOutline,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useContext } from "react";
import { useSelector } from "react-redux";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LabeledInput } from "../../LabeledInput";
import { PushButton } from "../../pushButton";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { BiSolidEdit } from "react-icons/bi";

export const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "10px 10px 0px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
  head: {
    width: "100%",
    color: "white",
    marginBottom: "5px",
  },
  day: {
    width: "100%",
    marginBottom: "15px",
    background: "#131314",
    padding: "10px",
    borderRadius: "5px",
  },
  dayInfo: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "80px",
    borderRadius: "5px",
    alignItems: "center",
    background: "#131314",
    padding: "0px 15px",
  },
  sideButtons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
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
  headEntry: {
    fontWeight: 600,
    marginBottom: "10px",
    whiteSpace: "nowrap",
  },
  entryName: {
    color: "white",
    fontWeight: 600,
    width: "60%",
  },
  enabled: {
    color: "white",
  },
  disabled: {
    color: "#adafb3",
  },
  dayValidText: {
    color: "#32CD32",
    fontSize: "14px",
    fontWeight: "bold",
  },
  invalid: {
    color: "red",
  },
  valueButton: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
    background: "transparent",
    color: "#0096FF",
    padding: "0",
    border: "none",
    fontWeight: 600,
    height: "35px",
  },
  finish: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
});

interface EditWeekProps {
  uid: string;
  block: Block;
  setBlock: (block: Block) => void;
  setEditingDay: (day: number) => void;
}

export const EditWeek = ({
  uid,
  block,
  setBlock,
  setEditingDay,
}: EditWeekProps) => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const curBlock = useSelector(selectCurBlock);
  const editingBlock = useSelector(selectEditingBlock);
  const editingWeekIdx = editingBlock ? curBlock?.curWeekIdx || 0 : 0;
  const { toggleScreenState } = useContext(ScreenStateContext);

  const handleBlockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBlock({ ...block, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value) setBlock({ ...block, startDate: value.toDate() });
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

  const handleAddDay = (idx: number) => {
    const newDay: Day = {
      name: `Day ${block.weeks[0].length + 1}`,
      exercises: [
        {
          name: "",
          apparatus: "",
          sets: [
            {
              reps: 0,
              weight: 0,
              completed: false,
              note: "",
            },
          ],
          weightType: WeightType.Pounds,
        },
      ],
      completedDate: undefined,
    };

    setBlock({
      ...block,
      weeks: block.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx ? week.toSpliced(idx, 0, newDay) : week
      ),
    });
  };

  const handleEditDay = (dayIdx: number) => {
    setEditingDay(dayIdx);
  };

  const handleRemoveDay = (dayIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx ? week.toSpliced(dayIdx, 1) : week
      ),
    });
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

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBlock({ ...block, length: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = () => {
    const blockToSubmit: Block = editingBlock
      ? block
      : {
          ...block,
          initialWeek: block.weeks[0],
        };

    toggleScreenState("fetching", true);
    dispatch(
      blockOp({
        uid,
        block: blockToSubmit,
        type: editingBlock ? BlockOp.Edit : BlockOp.Create,
      })
    );
    dispatch(setTemplate(undefined));
    setEditingBlock(false);
    router.push("/dashboard");
  };

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <LabeledInput
          label="Block Name: "
          textValue={block.name}
          onChangeText={handleBlockNameInput}
        />
        <LabeledInput
          label="Start Date: "
          dateValue={dayjs(block.startDate)}
          onChangeDate={handleDateInput}
        />
        <LabeledInput
          label="Length (weeks): "
          textValue={block.length}
          onChangeText={handleLengthInput}
        />
      </div>
      {block.weeks[editingWeekIdx].map((day, idx) => (
        <React.Fragment key={idx}>
          {block.weeks[editingWeekIdx].length < 7 && (
            <AddButton onClick={() => handleAddDay(idx)} />
          )}
          <div className={`${classes.entry} ${classes.day}`} key={idx}>
            <div className={classes.sideButtons}>
              <button
                className={`${classes.sideButton} ${
                  idx === 0 ? classes.buttonDisabled : classes.buttonEnabled
                }`}
                onClick={() => handleMoveDay(day, idx, "up")}
              >
                <ArrowBackIosNew className={classes.moveUpButton} />
              </button>
              <button
                className={`${classes.sideButton} ${
                  idx === block.weeks[editingWeekIdx].length - 1
                    ? classes.buttonDisabled
                    : classes.buttonEnabled
                }`}
                onClick={() => handleMoveDay(day, idx, "down")}
              >
                <ArrowBackIosNew className={classes.moveDownButton} />
              </button>
            </div>
            <div className={classes.dayInfo}>
              <LabeledInput
                label="Name: "
                textValue={day.name}
                onChangeText={(e: ChangeEvent<HTMLInputElement>) =>
                  handleDayNameInput(e, idx)
                }
              />
              <div className={classes.entry}>
                <button
                  className={classes.valueButton}
                  onClick={() => handleEditDay(idx)}
                >
                  <BiSolidEdit />
                  {day.exercises[0].name
                    ? `${day.exercises.length} Exercise${
                        day.exercises.length > 1 ? "s" : ""
                      }`
                    : "No Exercises"}
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
                onClick={() => handleRemoveDay(idx)}
              >
                <DeleteOutline />
              </button>
              <button
                className={`${classes.sideButton} ${
                  block.weeks[editingWeekIdx].length > 6
                    ? classes.buttonDisabled
                    : classes.buttonEnabled
                }`}
                onClick={() => handleDuplicateDay(idx)}
              >
                <ControlPointDuplicate />
              </button>
            </div>
          </div>
        </React.Fragment>
      ))}
      {block.weeks[editingWeekIdx].length < 7 && (
        <AddButton
          onClick={() => handleAddDay(block.weeks[editingWeekIdx].length)}
        />
      )}
      <PushButton height={40} width={100} onClick={handleSubmit}>
        <span className={classes.finish}>Save Block</span>
      </PushButton>
    </div>
  );
};
