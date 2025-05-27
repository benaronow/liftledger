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
import React, { ChangeEvent, useContext } from "react";
import { useSelector } from "react-redux";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { LabeledInput } from "../../LabeledInput";
import { PushButton } from "../../pushButton";
import { makeStyles } from "tss-react/mui";
import { AddButton } from "../../AddButton";
import { DayInfo } from "./DayInfo";

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
          />
        </React.Fragment>
      ))}
      {block.weeks[editingWeekIdx].length < 7 && (
        <AddButton
          onClick={() => handleAddDay(block.weeks[editingWeekIdx].length)}
        />
      )}
      <PushButton height={40} width={110} onClick={handleSubmit}>
        <span className={classes.finish}>Save Block</span>
      </PushButton>
    </div>
  );
};
