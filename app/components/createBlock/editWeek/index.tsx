import {
  blockOp,
  selectCurBlock,
  selectEditingBlock,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Block, BlockOp, Day, WeightType } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LabeledInput } from "../../LabeledInput";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { DayInfo } from "./DayInfo";
import { GrPowerReset } from "react-icons/gr";
import { FaSave } from "react-icons/fa";
import { DeleteResetDialog } from "../DeleteResetDialog";

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
  const [isResetting, setIsResetting] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | undefined>(undefined);

  const handleBlockNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    setBlock({ ...block, name: e.target.value });
  };

  const handleDateInput = (value: Dayjs | null) => {
    if (value) setBlock({ ...block, startDate: value.toDate() });
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

  const handleRemoveDay = () => {
    setBlock({
      ...block,
      weeks: block.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingIdx !== undefined
          ? week.toSpliced(deletingIdx, 1)
          : week
      ),
    });
    setDeletingIdx(undefined);
  };

  return (
    <>
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
        <div className={classes.titleContainer}>
          <button
            className={classes.titleButton}
            onClick={() => setIsResetting(true)}
          >
            <GrPowerReset />
          </button>
          <span className={classes.title}>{`${
            editingBlock ? "Edit" : "Add"
          } Days`}</span>
          <button className={classes.titleButton} onClick={handleSubmit}>
            <FaSave />
          </button>
        </div>
        {block.weeks[editingWeekIdx].map((day, idx) => (
          <React.Fragment key={idx}>
            {block.weeks[editingWeekIdx].length < 7 && (
              <AddButton
                onClick={() => handleAddDay(block.weeks[editingWeekIdx].length)}
              />
            )}
            <DayInfo
              day={day}
              dIdx={idx}
              block={block}
              setBlock={setBlock}
              setEditingDay={setEditingDay}
              setDeletingIdx={setDeletingIdx}
            />
          </React.Fragment>
        ))}
        {block.weeks[editingWeekIdx].length < 7 && (
          <AddButton
            onClick={() => handleAddDay(block.weeks[editingWeekIdx].length)}
          />
        )}
      </div>
      <DeleteResetDialog
        onClose={() => {
          setIsResetting(false);
          setDeletingIdx(undefined);
        }}
        isResetting={isResetting}
        isDeleting={deletingIdx !== undefined}
        onReset={() => setIsResetting(false)}
        onDelete={handleRemoveDay}
      />
    </>
  );
};
