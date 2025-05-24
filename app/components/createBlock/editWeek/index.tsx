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
  AddCircleOutline,
  ArrowBackIosNew,
  ControlPointDuplicate,
  DeleteOutline,
} from "@mui/icons-material";
import { Checkbox, Input } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext } from "react";
import { useSelector } from "react-redux";
import { useEditWeekStyles } from "./useEditWeekStyles";
import { useCreateBlockStyles } from "../useCreateBlockStyles";
import { emptyBlock } from "..";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";

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
  const { classes } = useEditWeekStyles();
  const { classes: createBlockClasses } = useCreateBlockStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const curBlock = useSelector(selectCurBlock);
  const editingBlock = useSelector(selectEditingBlock);
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
      weeks: block.weeks.map((week, idx) => ({
        ...week,
        days:
          idx === curBlock?.curWeekIdx
            ? week.days.map((day, idx) =>
                idx === dayIdx ? { ...day, name: e.target.value } : day
              )
            : week.days,
      })),
    });
  };

  const handleCheckGroup = (dayIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) => ({
        ...week,
        days:
          idx === curBlock?.curWeekIdx
            ? week.days.map((day, idx) =>
                idx === dayIdx
                  ? {
                      ...day,
                      hasGroup: !day.hasGroup,
                      groupName: "",
                    }
                  : day
              )
            : week.days,
      })),
    });
  };

  const handleGroupNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayIdx: number
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) => ({
        ...week,
        days:
          idx === curBlock?.curWeekIdx
            ? week.days.map((day, idx) =>
                idx === dayIdx
                  ? {
                      ...day,
                      groupName: e.target.value,
                    }
                  : day
              )
            : week.days,
      })),
    });
  };

  const handleAddDay = () => {
    const newDay: Day = {
      name: `Day ${block.weeks[0].days.length + 1}`,
      hasGroup: false,
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
          unilateral: false,
        },
      ],
      completed: false,
      completedDate: undefined,
    };

    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) => ({
        ...week,
        days: idx === curBlock?.curWeekIdx ? [...week.days, newDay] : week.days,
      })),
    });
  };

  const handleEditDay = (dayIdx: number) => {
    setEditingDay(dayIdx);
  };

  const handleRemoveDay = (dayIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) => ({
        ...week,
        days:
          idx === curBlock?.curWeekIdx
            ? week.days.toSpliced(dayIdx, 1)
            : week.days,
      })),
    });
  };

  const handleDuplicateDay = (dayIdx: number) => {
    const day: Day = {
      ...block.weeks[block.weeks.length - 1].days[dayIdx],
      name: `${block.weeks[0].days[dayIdx].name} (copy)`,
      completed: false,
    };

    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) => ({
        ...week,
        days:
          idx === curBlock?.curWeekIdx
            ? week.days.toSpliced(dayIdx + 1, 0, day)
            : week.days,
      })),
    });
  };

  const handleMoveDay = (day: Day, dayIdx: number, type: "up" | "down") => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setBlock({
        ...block,
        weeks: block.weeks.map((week, idx) => ({
          ...week,
          days:
            idx === curBlock?.curWeekIdx
              ? week.days
                  .toSpliced(dayIdx, 1)
                  .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, day)
              : week.days,
        })),
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
        <div className={`${classes.entry} ${classes.headEntry}`}>
          <span className={classes.entryName}>Block Name: </span>
          <Input
            className={classes.input}
            value={block.name}
            onChange={handleBlockNameInput}
          ></Input>
        </div>
        <div className={`${classes.entry} ${classes.headEntry}`}>
          <span className={classes.entryName}>Start Date: </span>
          <DatePicker
            className={`${classes.input} ${classes.dateInput}`}
            value={dayjs(block.startDate)}
            onChange={(value: Dayjs | null) => handleDateInput(value)}
          />
        </div>
        <div className={`${classes.entry} ${classes.headEntry}`}>
          <span className={classes.entryName}>Length (weeks): </span>
          <Input
            className={classes.input}
            value={block.length}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleLengthInput(e)
            }
          />
        </div>
      </div>
      {block.weeks[curBlock?.curWeekIdx || 0].days.map((day, idx) => (
        <div className={classes.day} key={idx}>
          <div className={`${classes.entry} ${classes.day}`}>
            <div className={`${classes.sideButtons} ${classes.leftButtons}`}>
              <div
                className={`${classes.sideButton} ${classes.sideButtonTopBottom}`}
              />
              <button
                className={`${classes.sideButton} ${classes.sideButtonTopTop} ${
                  idx === 0 ? classes.disabled : classes.enabled
                }`}
                onClick={() => handleMoveDay(day, idx, "up")}
              >
                <ArrowBackIosNew className={classes.moveUpButton} />
              </button>
              <div
                className={`${classes.sideButton} ${classes.sideButtonBottomBottom}`}
              />
              <button
                className={`${classes.sideButton} ${
                  classes.sideButtonBottomTop
                } ${
                  idx === block.weeks[curBlock?.curWeekIdx || 0].days.length - 1
                    ? classes.disabled
                    : classes.enabled
                }`}
                onClick={() => handleMoveDay(day, idx, "down")}
              >
                <ArrowBackIosNew className={classes.moveDownButton} />
              </button>
            </div>
            <div className={classes.dayInfo}>
              <div className={classes.entry}>
                <span className={classes.dayName}>Name: </span>
                <Input
                  className={classes.nameInput}
                  value={day.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleDayNameInput(e, idx)
                  }
                ></Input>
                <button
                  className={classes.editButton}
                  onClick={() => handleEditDay(idx)}
                >
                  Edit
                </button>
              </div>
              <div className={classes.entry}>
                <span
                  className={`${classes.dayName} ${
                    !day.hasGroup && classes.disabled
                  }`}
                >
                  Group:
                </span>
                <Input
                  className={classes.nameInput}
                  disabled={!day.hasGroup}
                  value={day.groupName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleGroupNameInput(e, idx)
                  }
                ></Input>
                <Checkbox
                  className={classes.editButton}
                  checked={day.hasGroup}
                  onClick={() => handleCheckGroup(idx)}
                />
              </div>
              <span
                className={`${classes.dayValidText} ${
                  !day.exercises[0].name && classes.invalid
                }`}
              >
                {day.exercises[0].name
                  ? `${day.exercises.length} Exercise${
                      day.exercises.length > 1 ? "s" : ""
                    } Added`
                  : "No Exercises Added!"}
              </span>
            </div>
            <div className={`${classes.sideButtons} ${classes.rightButtons}`}>
              <div
                className={`${classes.sideButton} ${classes.sideButtonTopBottom}`}
              />
              <button
                className={`${classes.sideButton} ${classes.sideButtonTopTop}`}
                onClick={() => handleRemoveDay(idx)}
              >
                <DeleteOutline
                  className={`${
                    block.weeks[curBlock?.curWeekIdx || 0].days.length === 1
                      ? classes.disabled
                      : classes.enabled
                  }`}
                />
              </button>
              <div
                className={`${classes.sideButton} ${classes.sideButtonBottomBottom}`}
              />
              <button
                className={`${classes.sideButton} ${classes.sideButtonBottomTop}`}
                onClick={() => handleDuplicateDay(idx)}
              >
                <ControlPointDuplicate
                  className={`${
                    block.weeks[curBlock?.curWeekIdx || 0].days.length > 6
                      ? classes.disabled
                      : classes.enabled
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      ))}
      {block.weeks[curBlock?.curWeekIdx || 0].days.length < 7 && (
        <div className={classes.addDayButtonContainer}>
          <div
            className={`${classes.addDayButton} ${classes.addDayButtonBottom}`}
          />
          <div
            className={`${classes.addDayButton} ${classes.addDayButtonTop}`}
            onClick={handleAddDay}
          >
            <AddCircleOutline />
          </div>
        </div>
      )}
      <div className={createBlockClasses.actions}>
        <div className={createBlockClasses.buttonContainer}>
          <div
            className={`${createBlockClasses.actionButton} ${classes.submitButtonBottom}`}
          />
          <button
            className={`${createBlockClasses.actionButton} ${classes.submitButtonTop}`}
            onClick={handleSubmit}
          >
            Save Block
          </button>
        </div>
        <div className={createBlockClasses.buttonContainer}>
          <div
            className={`${createBlockClasses.actionButton} ${classes.clearButtonBottom}`}
          />
          <button
            className={`${createBlockClasses.actionButton} ${classes.clearButtonTop}`}
            onClick={() => setBlock(emptyBlock)}
          >
            Clear Block
          </button>
        </div>
      </div>
    </div>
  );
};
