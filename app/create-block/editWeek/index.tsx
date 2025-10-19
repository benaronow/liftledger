import { Day, WeightType } from "@/lib/types";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { LabeledInput } from "../../components/LabeledInput";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../components/AddButton";
import { DayInfo } from "./DayInfo";
import { DeleteDialog } from "../../components/DeleteResetDialog";
import { EMPTY_BLOCK, useBlock } from "@/app/providers/BlockProvider";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    fontFamily: "League+Spartan",
    fontSize: "16px",
  },
  head: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    color: "white",
    marginBottom: "15px",
  },
  titleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#58585b",
    boxShadow: "0px 5px 10px #131314",
    width: "100%",
    marginBottom: "15px",
    padding: "5px",
    borderRadius: "5px",
  },
  title: {
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "20px",
    fontWeight: 600,
  },
  titleButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "35px",
    minWidth: "35px",
    color: "white",
    borderRadius: "5px",
    background: "#0096FF",
    fontSize: "20px",
    border: "none",
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
  setEditingDay: (day: number) => void;
}

export const EditWeek = ({ setEditingDay }: EditWeekProps) => {
  const { classes } = useStyles();
  const router = useRouter();
  const { curBlock, templateBlock, setTemplateBlock, editingWeekIdx } =
    useBlock();
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (curBlock && templateBlock === EMPTY_BLOCK) {
      router.push("/dashboard");
    }
  }, [curBlock, templateBlock]);

  const handleBlockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({ ...templateBlock, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateBlock({ ...templateBlock, startDate: value.toDate() });
  };

  const handleAddDay = (idx: number) => {
    const newDay: Day = {
      name: `Day ${templateBlock.weeks[editingWeekIdx].length + 1}`,
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

    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, wIdx) =>
        wIdx === editingWeekIdx ? week.toSpliced(idx, 0, newDay) : week
      ),
    });
  };

  const handleLengthInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({
      ...templateBlock,
      length: parseInt(e.target.value) || 0,
    });
  };

  const handleRemoveDay = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingIdx !== undefined
          ? week.toSpliced(deletingIdx, 1)
          : week
      ),
    });
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.head}>
          <LabeledInput
            label="Name: "
            textValue={templateBlock.name}
            onChangeText={handleBlockNameInput}
          />
          <LabeledInput
            label="Start: "
            dateValue={dayjs(templateBlock.startDate)}
            onChangeDate={handleDateInput}
          />
          <LabeledInput
            label="Weeks: "
            textValue={templateBlock.length}
            onChangeText={handleLengthInput}
          />
        </div>
        {templateBlock.weeks[editingWeekIdx].map((day, idx) => (
          <React.Fragment key={idx}>
            {templateBlock.weeks[editingWeekIdx].length < 7 && (
              <AddButton onClick={() => handleAddDay(idx)} />
            )}
            <DayInfo
              day={day}
              dIdx={idx}
              setEditingDay={setEditingDay}
              setDeletingIdx={setDeletingIdx}
            />
          </React.Fragment>
        ))}
        {templateBlock.weeks[editingWeekIdx].length < 7 && (
          <AddButton
            onClick={() =>
              handleAddDay(templateBlock.weeks[editingWeekIdx].length)
            }
          />
        )}
      </div>
      <div style={{ height: "300px" }}></div>
      <DeleteDialog
        onClose={() => {
          setDeletingIdx(undefined);
        }}
        type="day"
        isDeleting={deletingIdx !== undefined}
        onDelete={() => {
          handleRemoveDay();
          setDeletingIdx(undefined);
        }}
      />
    </>
  );
};
