"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import {
  setCurDay,
  setCurExercise,
  setCurWeek,
} from "@/lib/features/user/userSlice";
import { Day, Exercise, RouteType, Week, WeightType } from "@/types";
import { Spinner } from "../spinner";
import { useDashboardStyles } from "./useDashboardStyles";
import Link from "next/link";

export const Dashboard = () => {
  const { classes } = useDashboardStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (session && attemptedLogin && !curUser) {
      router.push("/create-account");
    }
  }, [attemptedLogin]);

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.Progress);
    router.prefetch(RouteType.Workout);
  }, []);

  const handleLogin = () => {
    router.push(`/auth/login`);
  };

  const handleStartDay = (cwIDx: number, cdIdx: number, ceIdx: number) => {
    dispatch(setCurWeek(cwIDx));
    dispatch(setCurDay(cdIdx));
    dispatch(setCurExercise(ceIdx));
  };

  const curWeekIdx =
    curUser?.curBlock?.weeks.findIndex((week) => !week.completed) || 0;
  const curDayIdx =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.findIndex(
      (day) => !day.completed
    ) || 0;
  const curDayName =
    curUser?.curBlock?.weeks[curWeekIdx]?.days.find((day) => !day.completed)
      ?.name || "Unavailable";
  const curExerciseIdx =
    curUser?.curBlock?.weeks[curWeekIdx]?.days[curDayIdx].exercises.findIndex(
      (exercise) => !exercise.completed
    ) || 0;
  const curExerciseName =
    curUser?.curBlock?.weeks[curWeekIdx]?.days[curDayIdx].exercises.find(
      (exercise) => !exercise.completed
    )?.name || "Unavailable";

  const getTotalWeight = (type: "lbs" | "kgs") => {
    return `${curUser?.curBlock?.weeks.reduce(
      (accWeek: number, curWeek: Week) => {
        return (
          accWeek +
          curWeek.days.reduce((accDay: number, curDay: Day) => {
            return (
              accDay +
              curDay.exercises.reduce((accEx: number, curEx: Exercise) => {
                return (
                  accEx +
                  (curEx.completed
                    ? curEx.weight.reduce(
                        (accWeight: number, curWeight: number, idx) =>
                          accWeight +
                          curWeight *
                            curEx.reps[idx] *
                            (curEx.weightType === type
                              ? 1
                              : curEx.weightType === WeightType.Kilograms
                              ? 2.205
                              : 0.454),
                        0
                      )
                    : 0)
                );
              }, 0)
            );
          }, 0)
        );
      },
      0
    )} lbs`;
  };

  const getDaysSinceLast = () => {
    let lastWorkoutDate = new Date(0);
    curUser?.curBlock?.weeks.forEach((week) =>
      week.days.forEach((day) =>
        day.exercises.forEach((exercise) => {
          const completionDate = day.completedDate
            ? new Date(day.completedDate)
            : new Date();
          if (exercise.completed && lastWorkoutDate < completionDate) {
            lastWorkoutDate = completionDate;
          }
        })
      )
    );
    const timeDifference =
      new Date().getTime() - new Date(lastWorkoutDate).getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  };

  const metricValueMap = [
    {
      metric: "Start Date",
      value: dayjs(curUser?.curBlock?.startDate).format("MM/DD/YYYY"),
    },
    {
      metric: "Block Length:",
      value: `${curUser?.curBlock?.length} week${
        (curUser?.curBlock?.length || 0) > 1 ? "s" : ""
      }`,
    },
    { metric: "Week:", value: `Week ${curWeekIdx + 1}` },
    { metric: "Day:", value: curDayName },
    { metric: "Exercise:", value: curExerciseName },
    { metric: "Days Since Last Workout:", value: getDaysSinceLast() },
    { metric: "Total Weight Lifted:", value: getTotalWeight("lbs") },
  ];

  if (session && !curUser) return <Spinner />;

  return (
    <div className={classes.container}>
      {session ? (
        <>
          <div className={classes.titleContainer}>
            <span className={classes.titleSmall}>Currently Completing:</span>
            <span className={classes.titleBig}>{curUser?.curBlock?.name}</span>
          </div>
          {curUser && (!curUser.curBlock || curUser.curBlock.completed) && (
            <span className={classes.noBlockText}>
              Create a training block to get started!
            </span>
          )}
          {curUser?.curBlock && !curUser.curBlock.completed && (
            <>
              {metricValueMap.map((pair, idx) => (
                <div key={idx} className={classes.entry}>
                  <span className={classes.name}>{pair.metric}</span>
                  <span className={classes.value}>{pair.value}</span>
                </div>
              ))}
              <div className={classes.buttonContainer}>
                <div
                  className={`${classes.startButtonBase} ${classes.startButtonBottom}`}
                ></div>
                <Link
                  className={`${classes.startButtonBase} ${classes.startButtonTop}`}
                  href={RouteType.Workout}
                  onClick={() =>
                    handleStartDay(curWeekIdx, curDayIdx, curExerciseIdx)
                  }
                >
                  <span>{`${
                    !curExerciseIdx || curExerciseIdx === 0 ? "Start" : "Resume"
                  } Workout`}</span>
                </Link>
              </div>
            </>
          )}
        </>
      ) : (
        <button className={classes.loginButton} onClick={handleLogin}>
          Log in to get started
        </button>
      )}
    </div>
  );
};
