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
    setBlock({
      ...block,
      weeks: block.weeks.map((week) => ({
        ...week,
        days: week.days
          .toSpliced(dayIdx, 1)
          .toSpliced(type === "up" ? dayIdx - 1 : dayIdx + 1, 0, day),
      })),
    });
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
      <div className={classes.entry}>
        <span className={classes.entryName}>Block Name: </span>
        <Input
          className={classes.input}
          value={block.name}
          onChange={handleBlockNameInput}
        ></Input>
      </div>
      <div className={classes.entry}>
        <span className={classes.entryName}>Start Date: </span>
        <DatePicker
          className={`${classes.input} ${classes.dateInput}`}
          value={dayjs(block.startDate)}
          onChange={(value: Dayjs | null) => handleDateInput(value)}
        />
      </div>
      <div className={classes.entry}>
        <span className={classes.entryName}>Length (weeks): </span>
        <Input
          className={classes.input}
          value={block.length}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleLengthInput(e)}
        />
      </div>
      {block.weeks[0].days.map((day, idx) => (
        <div className={classes.container} key={idx}>
          <div className={classes.entryDivider}></div>
          <div className={classes.entriesContainer}>
            <div className={`${classes.entry} ${classes.day}`}>
              <div className={classes.moveDayButtons}>
                <div onClick={() => handleMoveDay(day, idx, "up")}>
                  <ArrowBackIosNew className={classes.moveUpButton} />
                </div>
                <div onClick={() => handleMoveDay(day, idx, "down")}>
                  <ArrowBackIosNew className={classes.moveDownButton} />
                </div>
              </div>
              <div className={classes.entryContainer}>
                <div className={classes.entryColumn}>
                  <div className={`${classes.entry} ${classes.dayInfo}`}>
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
                  <div className={`${classes.entry} ${classes.dayInfo}`}>
                    <span
                      className={`${classes.dayName} ${
                        !day.hasGroup && classes.dayNameDisabled
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
              </div>
              <div>
                <div onClick={() => handleRemoveDay(idx)}>
                  <DeleteOutline
                    className={`${
                      block.weeks[0].days.length > 1
                        ? classes.removeButton
                        : classes.disabled
                    }`}
                  />
                </div>
                <div onClick={() => handleDuplicateDay(idx)}>
                  <ControlPointDuplicate
                    className={`${
                      block.weeks[0].days.length < 7
                        ? classes.removeButton
                        : classes.disabled
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {block.weeks[0].days.length < 7 && (
        <div className={classes.addDayButton} onClick={handleAddDay}>
          <AddCircleOutline></AddCircleOutline>
        </div>
      )}
      <div className={classes.entryDivider}></div>
    </form>
  );
};
