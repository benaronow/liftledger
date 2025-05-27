"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { LoginContext } from "../../providers/loginProvider";
import dayjs from "dayjs";
import { useAppDispatch } from "@/lib/hooks";
import {
  selectCurBlock,
  setCompletingDay,
} from "@/lib/features/user/userSlice";
import { Day, Exercise, RouteType, Set, WeightType } from "@/types";
import { Spinner } from "../spinner";
import { useDashboardStyles } from "./useDashboardStyles";
import Link from "next/link";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { useSelector } from "react-redux";
import { checkIsBlockDone } from "@/app/utils";

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

  const handleStartDay = () => {
    if (curBlock) {
      dispatch(
        setCompletingDay({
          dayIdx: curBlock.curDayIdx,
          weekIdx: curBlock.curWeekIdx,
        })
      );
    }
  };

  const getExerciseCompleted = (exercise: Exercise) => {
    return exercise.sets.reduce(
      (accSet: boolean, curSet: Set) => accSet && curSet.completed,
      true
    );
  };

  const getTotalWeight = (type: "lbs" | "kgs") => {
    return `${curBlock?.weeks.reduce((accWeek: number, curWeek: Day[]) => {
      return (
        accWeek +
        curWeek.reduce((accDay: number, curDay: Day) => {
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
    if (!curBlock?.weeks[0][0].completedDate) return 0;

    let lastWorkoutDate = new Date(0);
    curBlock?.weeks.forEach((week) =>
      week.forEach((day) =>
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

  const curDayName = curBlock
    ? curBlock.weeks[curBlock.curWeekIdx].find((day) => !day.completedDate)
        ?.name || "Unavailable"
    : "Unavailable";

  const metricValueMap = [
    {
      metric: "Start Date",
      value: dayjs(curBlock?.startDate).format("MM/DD/YYYY"),
    },
    {
      metric: "Block Length:",
      value: `${curBlock?.length} week${
        (curBlock?.length || 0) > 1 ? "s" : ""
      }`,
    },
    { metric: "Week:", value: `Week ${(curBlock?.curWeekIdx || 0) + 1}` },
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
            {curUser && (!curBlock || checkIsBlockDone(curBlock)) ? (
              <span className={classes.titleSmall}>
                Create a training block to get started!
              </span>
            ) : (
              <>
                <span className={classes.titleSmall}>
                  Currently Completing:
                </span>
                <span className={classes.titleBig}>{curBlock?.name}</span>
              </>
            )}
          </div>
          {curBlock && !checkIsBlockDone(curBlock) && (
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
