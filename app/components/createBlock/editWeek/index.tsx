import { Block, Day, WeightType } from "@/app/types";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useContext, useState } from "react";
import { ScreenStateContext } from "@/app/providers/ScreenStateProvider";
import { LabeledInput } from "../../LabeledInput";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { DayInfo } from "./DayInfo";
import { GrPowerReset } from "react-icons/gr";
import { FaSave } from "react-icons/fa";
import { DeleteResetDialog } from "../../DeleteResetDialog";
import { useBlock } from "@/app/providers/BlockProvider";

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
  const {
    curBlock,
    createBlock,
    editBlock,
    templateBlock,
    setTemplateBlock,
    unsetTemplateBlock,
  } = useBlock();
  const editingWeekIdx = curBlock?.curWeekIdx ?? 0;
  const { toggleScreenState } = useContext(ScreenStateContext);
  const [isResetting, setIsResetting] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const handleBlockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setTemplateBlock({ ...templateBlock, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value)
      setTemplateBlock({ ...templateBlock, startDate: value.toDate() });
  };

  const handleAddDay = (idx: number) => {
    const newDay: Day = {
      name: `Day ${templateBlock.weeks[0].length + 1}`,
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

  const handleSubmit = () => {
    const blockToSubmit: Block = curBlock
      ? templateBlock
      : {
          ...templateBlock,
          initialWeek: templateBlock.weeks[0],
        };

    toggleScreenState("fetching", true);
    if (curBlock) {
      editBlock(blockToSubmit);
    } else {
      createBlock(blockToSubmit);
    }
    unsetTemplateBlock();
    router.push("/dashboard");
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

  const clearAllDays = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx
          ? [
              {
                name: "Day 1",
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
                    weightType: "",
                  },
                ],
                completedDate: undefined,
              },
            ]
          : week
      ),
    });
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.head}>
          <LabeledInput
            label="Block Name: "
            textValue={templateBlock.name}
            onChangeText={handleBlockNameInput}
          />
          <LabeledInput
            label="Start Date: "
            dateValue={dayjs(templateBlock.startDate)}
            onChangeDate={handleDateInput}
          />
          <LabeledInput
            label="Length (weeks): "
            textValue={templateBlock.length}
            onChangeText={handleLengthInput}
          />
        </div>
        <div className={classes.titleContainer}>
          <button
            className={classes.titleButton}
            onClick={() => setIsResetting(true)}
          >
            <GrPowerReset />
          </button>
          <span className={classes.title}>{`${
            curBlock ? "Edit" : "Add"
          } Days`}</span>
          <button className={classes.titleButton} onClick={handleSubmit}>
            <FaSave />
          </button>
        </div>
        {templateBlock.weeks[editingWeekIdx].map((day, idx) => (
          <React.Fragment key={idx}>
            {templateBlock.weeks[editingWeekIdx].length < 7 && (
              <AddButton
                onClick={() =>
                  handleAddDay(templateBlock.weeks[editingWeekIdx].length)
                }
              />
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
      <DeleteResetDialog
        onClose={() => {
          setIsResetting(false);
          setDeletingIdx(undefined);
        }}
        type="day"
        isResetting={isResetting}
        isDeleting={deletingIdx !== undefined}
        onReset={() => {
          clearAllDays();
          setIsResetting(false);
        }}
        onDelete={() => {
          handleRemoveDay();
          setDeletingIdx(undefined);
        }}
      />
    </>
  );
};
