import { blockOp } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, WeightType } from "@/types";
import {
  AddCircleOutline,
  ArrowBackIosNew,
  ControlPointDuplicate,
  DeleteOutline,
} from "@mui/icons-material";
import { Input } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, RefObject, useEffect } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  createBlockContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Gabarito",
    fontSize: "20px",
    fontWeight: 900,
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
  },
  entryName: {
    fontFamily: "Gabarito",
    width: "60%",
    fontWeight: 600,
    fontSize: "16px",
  },
  entryDivider: {
    width: "100%",
    height: "1.5px",
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
    fontFamily: "Gabarito",
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
    marginBottom: "-5px",
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

  useEffect(() => {
    if (saveRef.current)
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
    dayNumber: number
  ) => {
    const newDay: Day = {
      ...block.weeks[0].days[dayNumber - 1],
      name: e.target.value,
    };
    const newDays: Day[] = block.weeks[0].days.toSpliced(
      dayNumber - 1,
      1,
      newDay
    );
    setBlock({ ...block, weeks: [{ ...block.weeks[0], days: newDays }] });
  };

  const handleAddDay = () => {
    const dayNumber = block.weeks[0].days.length + 1;
    const newDay: Day = {
      name: `Day ${dayNumber}`,
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
      weeks: [{ ...block.weeks[0], days: [...block.weeks[0].days, newDay] }],
    });
  };

  const handleEditDay = (dayNumber: number) => {
    setEditingDay(dayNumber);
  };

  const handleRemoveDay = (dayNumber: number) => {
    const newDays: Day[] = block.weeks[0].days.toSpliced(dayNumber - 1, 1);
    if (block.weeks[0].days.length > 1)
      setBlock({ ...block, weeks: [{ ...block.weeks[0], days: newDays }] });
  };

  const handleDuplicateDay = (dayNumber: number) => {
    const day: Day = {
      ...block.weeks[0].days[dayNumber - 1],
      name: `${block.weeks[0].days[dayNumber - 1].name} (copy)`,
    };
    const newDays: Day[] = block.weeks[0].days.toSpliced(dayNumber, 0, day);
    setBlock({ ...block, weeks: [{ ...block.weeks[0], days: newDays }] });
  };

  const handleMoveDay = (day: Day, dayNumber: number, type: "up" | "down") => {
    const withoutDay: Day[] = block.weeks[0].days.toSpliced(dayNumber - 1, 1);
    const newDays: Day[] = withoutDay.toSpliced(
      type === "up" ? dayNumber - 2 : dayNumber,
      0,
      day
    );
    setBlock({ ...block, weeks: [{ ...block.weeks[0], days: newDays }] });
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBlock({ ...block, length: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(blockOp({ uid, block, type: BlockOp.Create }));
    router.push("/dashboard");
  };

  return (
    <form
      className={classes.createBlockContainer}
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
      <div className={classes.entryDivider}></div>
      {block.weeks[0].days.map((day, idx) => (
        <div className={classes.entriesContainer} key={idx}>
          <div className={`${classes.entry} ${classes.day}`}>
            <div className={classes.moveDayButtons}>
              <div onClick={() => handleMoveDay(day, idx + 1, "up")}>
                <ArrowBackIosNew className={classes.moveUpButton} />
              </div>
              <div onClick={() => handleMoveDay(day, idx + 1, "down")}>
                <ArrowBackIosNew className={classes.moveDownButton} />
              </div>
            </div>
            <div className={classes.entryContainer}>
              <div className={classes.entryColumn}>
                <div className={`${classes.entry} ${classes.dayInfo}`}>
                  <Input
                    className={classes.nameInput}
                    value={day.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleDayNameInput(e, idx + 1)
                    }
                  ></Input>
                  <button
                    className={classes.editButton}
                    onClick={() => handleEditDay(idx + 1)}
                  >
                    EDIT
                  </button>
                </div>
                <span
                  className={`${classes.dayValidText} ${
                    !day.exercises[0].name && classes.invalid
                  }`}
                >
                  {day.exercises[0].name
                    ? "Exercises Added"
                    : "No Exercises Added!"}
                </span>
              </div>
            </div>
            <div>
              <div onClick={() => handleRemoveDay(idx + 1)}>
                <DeleteOutline
                  className={`${
                    block.weeks[0].days.length > 1
                      ? classes.removeButton
                      : classes.disabled
                  }`}
                />
              </div>
              <div onClick={() => handleDuplicateDay(idx + 1)}>
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
          <div className={classes.entryDivider}></div>
        </div>
      ))}
      {block.weeks[0].days.length < 7 && (
        <div className={classes.addDayButton} onClick={handleAddDay}>
          <AddCircleOutline></AddCircleOutline>
        </div>
      )}
    </form>
  );
};
