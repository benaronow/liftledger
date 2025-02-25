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
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "flex-start",
  },
  entriesContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  entryName: {
    fontFamily: "League+Spartan",
    width: "60%",
    fontWeight: 600,
    fontSize: "16px",
  },
  dayName: {
    fontFamily: "League+Spartan",
    width: "25%",
    fontWeight: 600,
    fontSize: "16px",
  },
  dayNameDisabled: {
    color: "gray",
  },
  entryDivider: {
    width: "100%",
    height: "2px",
    background: "#0096FF",
    marginBottom: "10px",
  },
  day: {
    justifyContent: "space-between",
  },
  dayInfo: {
    marginTop: "0px",
  },
  moveDayButtons: {
    display: "flex",
    flexDirection: "column",
    height: "50px",
    justifyContent: "center",
    alignItems: "center",
  },
  moveUpButton: {
    height: "15px",
    color: "#0096FF",
    transform: "rotate(90deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  moveDownButton: {
    height: "15px",
    color: "#0096FF",
    transform: "rotate(270deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  entryContainer: {
    display: "flex",
    flex: 1,
    padding: "10px 10px 10px 10px",
    background: "lightgray",
    borderRadius: "10px 10px 10px 10px",
    marginLeft: "5px",
    marginRight: "5px",
  },
  entryColumn: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  dayValidText: {
    color: "#32CD32",
    fontSize: "12px",
    fontWeight: "bold",
  },
  invalid: {
    color: "red",
  },
  input: {
    paddingLeft: "5px",
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    background: "white",
    width: "100%",
    fontSize: "16px",
  },
  dateInput: {
    paddingLeft: "0px",
  },
  nameInput: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    background: "white",
    width: "100%",
    paddingLeft: "5px",
    fontSize: "16px",
  },
  editButton: {
    background: "transparent",
    border: "none",
    color: "#0096FF",
    marginLeft: "5px",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "League+Spartan",
    "&:hover": {
      cursor: "pointer",
    },
  },
  removeButton: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  disabled: {
    color: "lightgray",
  },
  addDayButton: {
    color: "#0096FF",
    marginBottom: "5px",
    "&:hover": {
      cursor: "pointer",
    },
  },
});

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
  const { classes } = useStyles();
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
