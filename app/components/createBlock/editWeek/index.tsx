import { addBlock } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, Day, WeightType } from "@/types";
import { ArrowBackIosNew, DeleteOutline } from "@mui/icons-material";
import { Button, Input } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ChangeEvent, FormEvent } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  createBlockContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    width: "100%",
    justifyContent: "flex-start",
  },
  day: {
    justifyContent: "space-between",
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
    transform: "rotate(90deg)",
    "&:hover": {
      cursor: "pointer",
    },
  },
  moveDownButton: {
    height: "15px",
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
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    background: "white",
    width: "100%",
  },
  nameInput: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    background: "white",
    width: "100%",
  },
  editButton: {
    marginLeft: "5px",
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
    marginTop: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  submitButton: {
    marginTop: "10px",
    border: "solid",
    borderWidth: "1px",
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
      name: e.target.value,
      exercises: block.weeks[0].days[dayNumber - 1].exercises,
    };
    const newDays: Day[] = block.weeks[0].days.toSpliced(
      dayNumber - 1,
      1,
      newDay
    );
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleAddDay = () => {
    const dayNumber = block.weeks[0].days.length + 1;
    const newDay: Day = {
      name: `Day ${dayNumber}`,
      exercises: [
        {
          name: "",
          apparatus: "",
          musclesWorked: [],
          sets: 0,
          reps: [0],
          weight: [0],
          weightType: WeightType.Pounds,
          unilateral: false,
          prevSessionNote: "",
        },
      ],
    };
    setBlock({
      ...block,
      weeks: [{ number: 1, days: [...block.weeks[0].days, newDay] }],
    });
  };

  const handleEditDay = (dayNumber: number) => {
    setEditingDay(dayNumber);
  };

  const handleRemoveDay = (dayNumber: number) => {
    const newDays: Day[] = block.weeks[0].days.toSpliced(dayNumber - 1, 1);
    if (block.weeks[0].days.length > 1)
      setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleMoveDay = (day: Day, dayNumber: number, type: "up" | "down") => {
    const withoutDay: Day[] = block.weeks[0].days.toSpliced(dayNumber - 1, 1);
    const newDays: Day[] = withoutDay.toSpliced(
      type === "up" ? dayNumber - 2 : dayNumber,
      0,
      day
    );
    setBlock({ ...block, weeks: [{ number: 1, days: newDays }] });
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBlock({ ...block, length: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(addBlock({ uid, block }));
  };

  return (
    <form className={classes.createBlockContainer} onSubmit={handleSubmit}>
      <span>Create Training Block</span>
      <div className={classes.entry}>
        <span style={{ width: "60%" }}>Block Name: </span>
        <Input
          className={classes.input}
          value={block.name}
          onChange={handleBlockNameInput}
        ></Input>
      </div>
      <div className={classes.entry}>
        <span style={{ width: "60%" }}>Start Date: </span>
        <DatePicker
          className={classes.input}
          value={dayjs(block.startDate)}
          onChange={(value: Dayjs | null) => handleDateInput(value)}
        />
      </div>
      <div className={classes.entry}>
        <span style={{ width: "60%" }}>Length (weeks): </span>
        <Input
          className={classes.input}
          value={block.length}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleLengthInput(e)}
        />
      </div>
      {block.weeks[0].days.map((day, idx) => (
        <div className={`${classes.entry} ${classes.day}`} key={idx}>
          <div className={classes.moveDayButtons}>
            <div onClick={() => handleMoveDay(day, idx + 1, "up")}>
              <ArrowBackIosNew className={classes.moveUpButton} />
            </div>
            <div onClick={() => handleMoveDay(day, idx + 1, "down")}>
              <ArrowBackIosNew className={classes.moveDownButton} />
            </div>
          </div>
          <div className={classes.entryContainer}>
            <Input
              className={classes.nameInput}
              value={day.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleDayNameInput(e, idx + 1)
              }
            ></Input>
            <Button
              className={classes.editButton}
              onClick={() => handleEditDay(idx + 1)}
            >
              Edit
            </Button>
          </div>
          <div onClick={() => handleRemoveDay(idx + 1)}>
            <DeleteOutline
              className={`${
                block.weeks[0].days.length > 1
                  ? classes.removeButton
                  : classes.disabled
              }`}
            />
          </div>
        </div>
      ))}
      {block.weeks[0].days.length < 7 && (
        <Button className={classes.addDayButton} onClick={handleAddDay}>
          Add Day
        </Button>
      )}
      <Button className={classes.submitButton} type="submit">
        Save
      </Button>
    </form>
  );
};
