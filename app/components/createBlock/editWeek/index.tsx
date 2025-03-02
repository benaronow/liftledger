import {
  blockOp,
  selectCurUser,
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
import { ChangeEvent, FormEvent, RefObject, useEffect } from "react";
import { useSelector } from "react-redux";
import { useEditWeekStyles } from "./useEditWeekStyles";

interface EditWeekProps {
  uid: string;
  block: Block;
  setBlock: (block: Block) => void;
  setEditingDay: (day: number) => void;
  saveRef: RefObject<HTMLDivElement | null>;
}

export const EditWeek = ({
  uid,
  block,
  setBlock,
  setEditingDay,
  saveRef,
}: EditWeekProps) => {
  const { classes } = useEditWeekStyles();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const editingBlock = useSelector(selectEditingBlock);
  const curUser = useSelector(selectCurUser);

  useEffect(() => {
    if (saveRef.current && block.weeks[0].days.length > 1)
      saveRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [block.weeks[0].days.length]);

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
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day, idx) =>
          idx === dayIdx ? { ...day, name: e.target.value } : day
        ),
      })),
    });
  };

  const handleCheckGroup = (dayIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day, idx) =>
          idx === dayIdx
            ? {
                ...day,
                hasGroup: !day.hasGroup,
                groupName: "",
              }
            : day
        ),
      })),
    });
  };

  const handleGroupNameInput = (
    e: ChangeEvent<HTMLInputElement>,
    dayIdx: number
  ) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.map((day, idx) =>
          idx === dayIdx
            ? {
                ...day,
                groupName: e.target.value,
              }
            : day
        ),
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
          sets: 0,
          reps: [0],
          weight: [0],
          weightType: WeightType.Pounds,
          unilateral: false,
          note: "",
          completed: false,
        },
      ],
      completed: false,
      completedDate: undefined,
    };
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: [
          ...week.days,
          week.completed
            ? {
                ...newDay,
                completed: true,
              }
            : newDay,
        ],
      })),
    });
  };

  const handleEditDay = (dayIdx: number) => {
    setEditingDay(dayIdx);
  };

  const handleRemoveDay = (dayIdx: number) => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.toSpliced(dayIdx, 1),
      })),
    });
  };

  const handleDuplicateDay = (dayIdx: number) => {
    const day: Day = {
      ...block.weeks[block.weeks.length - 1].days[dayIdx],
      name: `${block.weeks[0].days[dayIdx].name} (copy)`,
    };
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days.toSpliced(dayIdx + 1, 0, day),
      })),
    });
  };

  const handleMoveDay = (day: Day, dayIdx: number, type: "up" | "down") => {
    if ((dayIdx !== 0 || type !== "up") && (dayIdx !== 6 || type !== "down")) {
      setBlock({
        ...block,
        weeks: block.weeks.map((week) => ({
          ...week,
          days: week.days
            .toSpliced(dayIdx, 1)
            .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, day),
        })),
      });
    }
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBlock({ ...block, length: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newWeeks = [...block.weeks];
    Array.from(Array(block.length - 1)).forEach(() =>
      newWeeks.push(block.weeks[0])
    );
    const fullBlock = { ...block, weeks: newWeeks };
    dispatch(
      blockOp({
        uid,
        block: editingBlock ? block : fullBlock,
        curWeek: editingBlock ? curUser?.curWeek || 0 : 0,
        type: BlockOp.Create,
      })
    );
    dispatch(setTemplate(undefined));
    setEditingBlock(false);
    router.push("/dashboard");
  };

  return (
    <form
      className={classes.container}
      id="create-block-form"
      onSubmit={handleSubmit}
    >
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
      {block.weeks[0].days.map((day, idx) => (
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
                  idx === block.weeks[0].days.length - 1
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
                    block.weeks[0].days.length === 1
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
                    block.weeks[0].days.length > 6
                      ? classes.disabled
                      : classes.enabled
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      ))}
      {block.weeks[0].days.length < 7 && (
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
    </form>
  );
};
