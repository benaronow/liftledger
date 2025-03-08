"use client";

import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import {
  blockOp,
  selectCurUser,
  setCurBlock,
  setCurDay,
  setCurExercise,
  setCurWeek,
  updateUser,
} from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { BlockOp, NumberChange, RouteType } from "@/types";
import { Add, Remove } from "@mui/icons-material";
import { Input, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useCompleteDayStyles } from "./useCompleteDayStyles";
import { Spinner } from "../spinner";

export const CompleteDay = () => {
  const { classes } = useCompleteDayStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();
  const curRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.Home);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Progress);
  }, []);

  const exercises =
    curUser &&
    curUser.curBlock &&
    curUser.curWeek !== undefined &&
    curUser.curDay !== undefined
      ? curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay].exercises
      : [];
  useEffect(() => {
    if (!exercisesState.length) router.push("/dashboard");
  }, [exercises]);

  const [exercisesState, setExercisesState] = useState(exercises);
  useEffect(() => {
    for (let i = 0; i < exercises.length; i++) {
      if (exercises[i].reps.length < exercises[i].sets) {
        const newReps = [...exercises[i].reps];
        const newWeight = [...exercises[i].weight];
        Array.from(
          Array(exercises[i].sets - exercises[i].reps.length).keys()
        ).forEach(() => {
          newReps.push(newReps[0]);
          newWeight.push(newWeight[0]);
        });
        const newExercise = {
          ...exercises[i],
          reps: newReps,
          weight: newWeight,
        };
        setExercisesState((prev) => prev.toSpliced(i, 1, newExercise));
      }
    }
  }, [exercises]);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  useEffect(() => {
    if (curUser?.curWeek === undefined || curUser?.curDay === undefined) {
      router.push("/dashboard");
    }
  }, [curUser]);

  useEffect(() => {
    if (curRef.current && curUser?.curExercise)
      curRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [curUser?.curExercise]);

  const handleSetsChange = (type: NumberChange) => {
    if (curUser?.curExercise !== undefined) {
      if (
        type === NumberChange.SubtractSet &&
        exercisesState[curUser.curExercise].sets > 1
      ) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          sets: exercisesState[curUser.curExercise].sets - 1,
          reps: exercisesState[curUser.curExercise].reps.toSpliced(
            exercisesState[curUser.curExercise].sets - 1,
            1
          ),
          weight: exercisesState[curUser.curExercise].weight.toSpliced(
            exercisesState[curUser.curExercise].sets - 1,
            1
          ),
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
      if (type === NumberChange.AddSet) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          sets: exercisesState[curUser.curExercise].sets + 1,
          reps: [
            ...exercisesState[curUser.curExercise].reps,
            exercisesState[curUser.curExercise].reps[
              exercisesState[curUser.curExercise].sets - 1
            ],
          ],
          weight: [
            ...exercisesState[curUser.curExercise].weight,
            exercisesState[curUser.curExercise].weight[
              exercisesState[curUser.curExercise].sets - 1
            ],
          ],
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
    }
  };

  const handleRepsWeightChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: NumberChange,
    set: number
  ) => {
    if (curUser?.curExercise !== undefined) {
      if (type === NumberChange.Reps) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          reps: exercisesState[curUser.curExercise].reps.toSpliced(
            set,
            1,
            e.target.value as unknown as number
          ),
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
      if (type === NumberChange.Weight) {
        const newExercise = {
          ...exercisesState[curUser.curExercise],
          weight: exercisesState[curUser.curExercise].weight.toSpliced(
            set,
            1,
            e.target.value as unknown as number
          ),
        };
        setExercisesState(
          exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
        );
      }
    }
  };

  const handleNoteChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (curUser?.curExercise !== undefined) {
      const newExercise = {
        ...exercisesState[curUser?.curExercise],
        note: e.target.value,
      };
      setExercisesState(
        exercisesState.toSpliced(curUser.curExercise, 1, newExercise)
      );
    }
  };

  const getPreviousSessionNote = (idx: number) => {
    if (curUser?.curWeek !== undefined && curUser?.curDay !== undefined) {
      const curDayDetail =
        curUser?.curBlock?.weeks[curUser.curWeek].days[curUser.curDay];
      if (curDayDetail?.hasGroup) {
        let note = "";
        for (let i = 0; i < curUser.curDay; i++) {
          const checkDayDetail =
            curUser?.curBlock?.weeks[curUser.curWeek].days[i];
          if (
            checkDayDetail?.hasGroup &&
            checkDayDetail.groupName === curDayDetail.groupName
          )
            note = checkDayDetail.exercises[idx].note || "None";
        }
        if (note) return note;
      }
      if (curUser.curWeek > 0) {
        if (!curDayDetail?.hasGroup)
          return (
            curUser?.curBlock?.weeks[curUser.curWeek - 1].days[curUser.curDay]
              .exercises[idx].note || "None"
          );
        const prevWeekDayIdx =
          curUser?.curBlock?.weeks[curUser.curWeek - 1].days.findLastIndex(
            (day) => day.hasGroup && day.groupName === curDayDetail.groupName
          ) || curUser.curDay;
        return (
          curUser?.curBlock?.weeks[curUser.curWeek - 1].days[prevWeekDayIdx]
            .exercises[idx].note || "None"
        );
      }
    }
    return "None";
  };

  const laterSession = () => {
    if (
      curUser?.curBlock &&
      curUser.curWeek !== undefined &&
      curUser.curDay !== undefined
    ) {
      const curDayDetail =
        curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay];
      for (
        let i = curUser.curDay + 1;
        i < curUser?.curBlock?.weeks[curUser.curWeek || 0].days.length;
        i++
      ) {
        const laterSessionDetail =
          curUser.curBlock.weeks[curUser.curWeek].days[i];
        if (
          curDayDetail.hasGroup &&
          laterSessionDetail.hasGroup &&
          curDayDetail.groupName === laterSessionDetail.groupName
        )
          return i;
      }
    }
    return 0;
  };

  const handleBack = () => {
    if (curUser?.curExercise) dispatch(setCurExercise(curUser.curExercise - 1));
  };

  const handleNext = (completedDay: boolean) => {
    if (
      curUser?.curBlock &&
      curUser.curWeek !== undefined &&
      curUser.curDay !== undefined &&
      curUser.curExercise !== undefined
    ) {
      if (!completedDay) dispatch(setCurExercise(curUser.curExercise + 1));
      const completeExercise = {
        ...exercisesState[curUser.curExercise],
        completed: true,
      };
      const progress = { ...curUser.progress };
      const newProgressEntry = [
        completeExercise.sets,
        completeExercise.reps,
        completeExercise.weight,
        completeExercise.weightType,
        new Date(),
      ];
      if (progress[`${completeExercise.name}`]) {
        progress[`${completeExercise.name}`] = progress[
          `${completeExercise.name}`
        ].concat([newProgressEntry]);
      } else {
        progress[`${completeExercise.name}`] = [newProgressEntry];
      }
      const updatedUser = { ...curUser, progress };
      dispatch(updateUser(updatedUser));
      const newExercisesState = exercisesState.toSpliced(
        curUser.curExercise,
        1,
        completeExercise
      );
      setExercisesState(newExercisesState);
      const newDay = {
        ...curUser.curBlock.weeks[curUser.curWeek].days[curUser.curDay],
        exercises: newExercisesState,
        completed: completedDay,
        completedDate: new Date(),
      };
      const laterSessionIdx = laterSession();
      const newLaterSession = laterSessionIdx
        ? {
            ...curUser.curBlock.weeks[curUser.curWeek].days[laterSessionIdx],
            exercises: curUser.curBlock.weeks[curUser.curWeek].days[
              laterSessionIdx
            ].exercises.map((exercise, idx) => {
              return {
                ...exercise,
                sets: newExercisesState[idx].sets,
                reps: newExercisesState[idx].reps,
                weight: newExercisesState[idx].weight,
              };
            }),
          }
        : undefined;
      const newDays = curUser.curBlock.weeks[curUser.curWeek].days.toSpliced(
        curUser.curDay,
        1,
        newDay
      );
      if (newLaterSession) newDays.splice(laterSessionIdx, 1, newLaterSession);
      const completedWeek =
        completedDay && curUser.curDay === newDays.length - 1;
      const newWeek = {
        ...curUser.curBlock.weeks[curUser.curWeek],
        days: newDays,
        completed: completedWeek,
      };
      const newWeeks = curUser.curBlock.weeks.toSpliced(
        curUser.curWeek,
        1,
        newWeek
      );
      const completedBlock =
        completedWeek && curUser.curWeek === curUser.curBlock.length - 1;
      if (completedBlock) dispatch(setCurBlock(undefined));
      const block = {
        ...curUser.curBlock,
        weeks: newWeeks,
        completed: completedBlock,
      };
      dispatch(
        blockOp({
          uid: curUser._id || "",
          block,
          curWeek: curUser.curWeek,
          type: BlockOp.Edit,
        })
      );
    }
    if (completedDay) {
      router.push("/dashboard");
      dispatch(setCurWeek(undefined));
      dispatch(setCurDay(undefined));
      dispatch(setCurExercise(undefined));
    }
  };

  const handleQuit = () => {
    router.push("/dashboard");
    dispatch(setCurWeek(undefined));
    dispatch(setCurDay(undefined));
    dispatch(setCurExercise(undefined));
  };

  if (!exercises.length) return <Spinner />;

  return (
    <div className={classes.container}>
      <div className={classes.box}>
        {exercises?.map((exercise, idx) => (
          <div
            className={classes.exerciseContainer}
            ref={idx === curUser?.curExercise ? curRef : null}
            key={idx}
          >
            <div className={classes.eName}>
              <span className={classes.entryTitle}>{exercise.name}</span>
              <span className={classes.entryTitle}>{`(${exercise.apparatus}, ${
                exercise.unilateral ? "Unilateral" : "Bilateral"
              })`}</span>
            </div>
            {idx === curUser?.curExercise && (
              <>
                <div className={classes.entry}>
                  <span
                    className={classes.entryName}
                  >{`Previous session note: ${getPreviousSessionNote(
                    idx
                  )}`}</span>
                </div>
                <div className={classes.setsEntry}>
                  <div
                    className={`${classes.changeSetButtonContainer} ${classes.leftContainer}`}
                  >
                    <div
                      className={`${classes.changeSetButton} ${classes.subtractSetButtonBottom}`}
                    />
                    <div
                      className={`${classes.changeSetButton} ${classes.subtractSetButtonTop}`}
                      onClick={() => handleSetsChange(NumberChange.SubtractSet)}
                    >
                      <Remove className={classes.changeSetIcon} />
                    </div>
                  </div>
                  <span className={`${classes.entryName} ${classes.sets}`}>
                    {`Sets: ${exercisesState[idx].sets}`}
                  </span>
                  <div
                    className={`${classes.changeSetButtonContainer} ${classes.rightContainer}`}
                  >
                    <div
                      className={`${classes.changeSetButton} ${classes.addSetButtonBottom}`}
                    />
                    <div
                      className={`${classes.changeSetButton} ${classes.addSetButtonTop}`}
                      onClick={() => handleSetsChange(NumberChange.AddSet)}
                    >
                      <Add className={classes.changeSetIcon} />
                    </div>
                  </div>
                </div>
                <div>
                  {Array.from(Array(exercisesState[idx].sets).keys()).map(
                    (set) => (
                      <div
                        className={classes.entry}
                        key={`${exercisesState[idx].name}${set}`}
                      >
                        <span
                          className={`${classes.entryName} ${classes.entrySetsReps}`}
                        >
                          Reps:
                        </span>
                        <Input
                          className={classes.input}
                          inputProps={{
                            style: { textAlign: "center" },
                          }}
                          value={
                            set < exercisesState[idx].reps.length
                              ? exercisesState[idx].reps[set]
                              : exercisesState[idx].reps[0]
                          }
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (/^\d*$/.test(e.target.value))
                              handleRepsWeightChange(e, NumberChange.Reps, set);
                          }}
                        />
                        <span
                          className={`${classes.entryName} ${classes.entryWeight}`}
                        >
                          Weight:
                        </span>
                        <Input
                          className={classes.input}
                          inputProps={{
                            style: { textAlign: "center" },
                          }}
                          value={
                            set < exercisesState[idx].weight.length
                              ? exercisesState[idx].weight[set]
                              : exercisesState[idx].weight[0]
                          }
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (/^\d*\.?\d*$/.test(e.target.value))
                              handleRepsWeightChange(
                                e,
                                NumberChange.Weight,
                                set
                              );
                          }}
                        />
                        <span className={classes.entryName}>lbs</span>
                      </div>
                    )
                  )}
                </div>
                <div className={classes.entry}>
                  <span className={classes.noteName}>Leave a note: </span>
                  <Input
                    className={classes.noteInput}
                    value={exercisesState[idx].note}
                    onChange={handleNoteChange}
                  />
                </div>
                <div className={classes.actions}>
                  {idx !== 0 && (
                    <div className={classes.buttonContainer}>
                      <div
                        className={`${classes.actionButton} ${classes.prevButtonBottom}`}
                      />
                      <button
                        className={`${classes.actionButton} ${classes.prevButtonTop}`}
                        onClick={handleBack}
                      >
                        Previous
                      </button>
                    </div>
                  )}
                  <div className={classes.buttonContainer}>
                    <div
                      className={`${classes.actionButton} ${
                        classes.nextButtonBottom
                      } ${idx === 0 && classes.nextButtonSide}`}
                    />
                    <button
                      className={`${classes.actionButton} ${
                        classes.nextButtonTop
                      } ${idx === 0 && classes.nextButtonSide}`}
                      onClick={() => handleNext(idx === exercises.length - 1)}
                    >
                      {idx === exercises.length - 1 ? "Finish" : "Next"}
                    </button>
                  </div>
                  <div className={classes.buttonContainer}>
                    <div
                      className={`${classes.actionButton} ${classes.pauseButtonBottom}`}
                    />
                    <button
                      className={`${classes.actionButton} ${classes.pauseButtonTop}`}
                      onClick={handleQuit}
                    >
                      Pause
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
