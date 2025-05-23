import { selectCurBlock } from "@/lib/features/user/userSlice";
import { Exercise } from "@/types";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  note: {
    fontSize: "16px",
  },
  inputRow: {
    display: "flex",
    fontSize: "14px",
    alignItems: "center",
    border: "solid 2px #adafb3",
    borderRadius: "5px",
    padding: "5px",
    marginBottom: "10px",
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: "16px",
    width: "100%",
  },
  rowName: {
    marginRight: "5px",
    fontWeight: "600",
  },
});

interface Props {
  setIdx: number;
  exerciseState: Exercise;
  exercisesState: Exercise[];
  setExerciseState: Dispatch<SetStateAction<Exercise>>;
}

export const EditSet = ({
  setIdx,
  exerciseState,
  exercisesState,
  setExerciseState,
}: Props) => {
  const { classes } = useStyles();
  const curBlock = useSelector(selectCurBlock);
  const [tempWeight, setTempWeight] = useState(
    setIdx !== undefined ? `${exerciseState.sets[setIdx].weight || ""}` : ""
  );
  type ChangeSetType = "reps" | "weight" | "note";

  const setInfoMap = [
    {
      name: "reps",
      title: "Reps:",
      value: setIdx !== undefined ? exerciseState?.sets[setIdx]?.reps : "",
    },
    {
      name: "weight",
      title: "Weight:",
      value: tempWeight,
    },
    {
      name: "note",
      title: "Note:",
      value: setIdx !== undefined ? exerciseState?.sets[setIdx]?.note : "",
    },
  ];

  const getPreviousSessionNote = (exerciseIdx: number, setIdx: number) => {
    if (curBlock) {
      const curDayDetail =
        curBlock.weeks[curBlock.curWeekIdx].days[curBlock.curDayIdx];
      if (curDayDetail?.hasGroup) {
        let note = "";
        for (let i = 0; i < curBlock.curDayIdx; i++) {
          const checkDayDetail = curBlock.weeks[curBlock.curWeekIdx].days[i];
          if (
            checkDayDetail?.hasGroup &&
            checkDayDetail.groupName === curDayDetail.groupName
          )
            note =
              checkDayDetail.exercises[exerciseIdx].sets[setIdx]?.note || "";
        }
        if (note) return note;
      }
      if (curBlock.curWeekIdx > 0) {
        if (!curDayDetail?.hasGroup)
          return (
            curBlock.weeks[curBlock.curWeekIdx - 1].days[curBlock.curDayIdx]
              .exercises[exerciseIdx].sets[setIdx].note || ""
          );
        const prevWeekDayIdx =
          curBlock.weeks[curBlock.curWeekIdx - 1].days.findLastIndex(
            (day) => day.hasGroup && day.groupName === curDayDetail.groupName
          ) || curBlock.curDayIdx;
        return (
          curBlock.weeks[curBlock.curWeekIdx - 1].days[prevWeekDayIdx]
            .exercises[exerciseIdx].sets[setIdx].note || ""
        );
      }
    }
    return "";
  };

  const handleSetChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: ChangeSetType
  ) => {
    setExerciseState({
      ...exerciseState,
      sets: exerciseState?.sets.toSpliced(setIdx, 1, {
        ...exerciseState.sets[setIdx],
        reps:
          type === "reps"
            ? parseInt(e.target.value) || 0
            : exerciseState.sets[setIdx].reps,
        weight:
          type === "weight"
            ? parseFloat(e.target.value) || 0
            : exerciseState.sets[setIdx].weight,
        note:
          type === "note" ? e.target.value : exerciseState.sets[setIdx].note,
      }),
    });

    if (
      type === "weight" &&
      /^$|^-?(?:\d+\.\d*|\d+\.?|\.?\d+)$/.test(e.target.value)
    )
      setTempWeight(e.target.value);
  };

  return (
    <>
      {getPreviousSessionNote(
        exercisesState.findIndex(
          (e) =>
            e.name === exerciseState.name &&
            e.apparatus === exerciseState.apparatus
        ),
        setIdx || 0
      ) && (
        <span
          className={classes.note}
        >{`Previous session note: ${getPreviousSessionNote(
          exercisesState.findIndex(
            (e) =>
              e.name === exerciseState.name &&
              e.apparatus === exerciseState.apparatus
          ),
          setIdx || 0
        )}`}</span>
      )}
      {setInfoMap.map((setInfo) => (
        <div className={classes.inputRow} key={setInfo.name}>
          <span className={classes.rowName}>{setInfo.title}</span>
          <input
            className={classes.input}
            value={setInfo.value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleSetChange(e, setInfo.name as ChangeSetType);
            }}
          />
        </div>
      ))}
    </>
  );
};
