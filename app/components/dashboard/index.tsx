"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import {
  selectCurBlock,
  setCurDay,
  setCurWeek,
} from "@/lib/features/user/userSlice";
import { Day, Exercise, RouteType, Set, Week, WeightType } from "@/types";
import { Spinner } from "../spinner";
import { useDashboardStyles } from "./useDashboardStyles";
import Link from "next/link";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { useSelector } from "react-redux";

export const Dashboard = () => {
  const { classes } = useDashboardStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  const curBlock = useSelector(selectCurBlock);
  const { isFetching, toggleScreenState } = useContext(ScreenStateContext);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (session && attemptedLogin && !curUser) {
      router.push("/create-account");
    }
  }, [attemptedLogin]);

  useEffect(() => {
    toggleScreenState("fetching", false);
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.History);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.Progress);
    router.prefetch(RouteType.Workout);
  }, []);

  const curWeekIdx = curBlock?.weeks.findIndex((week) => !week.completed) || 0;
  const curDayIdx =
    curBlock?.weeks[curWeekIdx]?.days.findIndex((day) => !day.completed) || 0;
  const curDayName =
    curBlock?.weeks[curWeekIdx]?.days.find((day) => !day.completed)?.name ||
    "Unavailable";
  const handleStartDay = () => {
    dispatch(setCurWeek(curWeekIdx));
    dispatch(setCurDay(curDayIdx));
  };

  const getExerciseCompleted = (exercise: Exercise) => {
    return exercise.sets.reduce(
      (accSet: boolean, curSet: Set) => accSet && curSet.completed,
      true
    );
  };

  const getTotalWeight = (type: "lbs" | "kgs") => {
    return `${curBlock?.weeks.reduce((accWeek: number, curWeek: Week) => {
      return (
        accWeek +
        curWeek.days.reduce((accDay: number, curDay: Day) => {
          return (
            accDay +
            curDay.exercises.reduce((accEx: number, curEx: Exercise) => {
              return (
                accEx +
                curEx.sets.reduce(
                  (accWeight: number, curSet: Set) =>
                    accWeight +
                    (curSet.completed
                      ? curSet.reps *
                        curSet.weight *
                        (curEx.weightType === type
                          ? 1
                          : curEx.weightType === WeightType.Kilograms
                          ? 2.205
                          : 0.454)
                      : 0),
                  0
                )
              );
            }, 0)
          );
        }, 0)
      );
    }, 0)} lbs`;
  };

  const getDaysSinceLast = () => {
    let lastWorkoutDate = new Date(0);
    curBlock?.weeks.forEach((week) =>
      week.days.forEach((day) =>
        day.exercises.forEach((exercise) => {
          const completionDate = day.completedDate
            ? new Date(day.completedDate)
            : new Date();
          if (
            getExerciseCompleted(exercise) &&
            lastWorkoutDate < completionDate
          ) {
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
      value: dayjs(curBlock?.startDate).format("MM/DD/YYYY"),
    },
    {
      metric: "Block Length:",
      value: `${curUser?.curBlock?.length} week${
        (curUser?.curBlock?.length || 0) > 1 ? "s" : ""
      }`,
    },
    { metric: "Week:", value: `Week ${curWeekIdx + 1}` },
    { metric: "Day:", value: curDayName },
    { metric: "Days Since Last Workout:", value: getDaysSinceLast() },
    { metric: "Total Weight Lifted:", value: getTotalWeight("lbs") },
  ];

  if ((session && !curUser) || isFetching) return <Spinner />;

  return (
    <div className={classes.container}>
      {session ? (
        <>
          <div className={classes.titleContainer}>
            <span className={classes.titleSmall}>Currently Completing:</span>
            <span className={classes.titleBig}>{curBlock?.name}</span>
          </div>
          {curUser && (!curBlock || curBlock.completed) && (
            <span className={classes.noBlockText}>
              Create a training block to get started!
            </span>
          )}
          {curBlock && !curBlock.completed && (
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
                  onClick={() => {
                    toggleScreenState("fetching", true);
                    handleStartDay();
                  }}
                >
                  <span>Lift!</span>
                </Link>
              </div>
            </>
          )}
        </>
      ) : (
        <div className={classes.welcome}>
          <span className={`${classes.titleContainer} ${classes.titleBig}`}>
            Welcome to LiftLedger!
          </span>
          <div className={classes.actionButtonContainer}>
            <div
              className={`${classes.actionButton} ${classes.accountButtonBottom}`}
            />
            <button
              className={`${classes.actionButton} ${classes.accountButtonTop}`}
              onClick={() => {
                toggleScreenState("fetching", true);
                router.push("/auth/login");
              }}
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
