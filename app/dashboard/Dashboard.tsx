"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "../providers/UserProvider";
import dayjs from "dayjs";
import { Day, Exercise, RouteType, Set, WeightType } from "@/lib/types";
import { Spinner } from "../components/spinner";
import Link from "next/link";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { checkIsBlockDone } from "@/app/utils";
import { useBlock } from "@/app/providers/BlockProvider";

export const Dashboard = () => {
  const { session, attemptedLogin, curUser } = useUser();
  const { curBlock, curBlockLoading } = useBlock();
  const { isFetching, toggleScreenState } = useScreenState();
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

  if ((session && !curUser) || curBlockLoading || isFetching)
    return <Spinner />;

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-evenly w-100"
      style={{
        position: "relative",
        height: "100dvh",
        padding: "50px 50px 70px",
      }}
    >
      {session ? (
        <>
          <div
            className="d-flex flex-column align-items-center text-white"
            style={{ fontFamily: "League+Spartan", fontWeight: 900 }}
          >
            {curUser && (!curBlock || checkIsBlockDone(curBlock)) ? (
              <span
                className="text-nowrap"
                style={{ fontSize: "16px", marginBottom: "5px" }}
              >
                Create a training block to get started!
              </span>
            ) : (
              <>
                <span
                  className="text-nowrap"
                  style={{ fontSize: "16px", marginBottom: "5px" }}
                >
                  Currently Completing:
                </span>
                <span style={{ fontSize: "24px" }}>{curBlock?.name}</span>
              </>
            )}
          </div>
          {curBlock && !checkIsBlockDone(curBlock) && (
            <>
              {metricValueMap.map((pair, idx) => (
                <div
                  key={idx}
                  className="d-flex align-items-center justify-content-around w-100 text-white text-nowrap"
                  style={{
                    fontFamily: "League+Spartan",
                    fontSize: "16px",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    className="d-flex fw-bold justify-content-start text-start"
                    style={{ width: "75%" }}
                  >
                    {pair.metric}
                  </span>
                  <span
                    className="d-flex justify-content-end text-end"
                    style={{ width: "125%" }}
                  >
                    {pair.value}
                  </span>
                </div>
              ))}
              <div className="w-100" style={{ height: "67px" }}>
                <div
                  className="d-flex border border-0 justify-content-center align-items-center text-white text-decoration-none"
                  style={{
                    fontFamily: "League+Spartan",
                    fontSize: "20px",
                    fontWeight: 600,
                    borderRadius: "25px",
                    height: "60px",
                    background: "#004c81",
                    transform: "translateY(7px)",
                  }}
                />
                <Link
                  className="d-flex w-100 border border-0 justify-content-center align-items-center text-white text-decoration-none"
                  style={{
                    fontFamily: "League+Spartan",
                    fontSize: "20px",
                    fontWeight: 600,
                    borderRadius: "25px",
                    height: "60px",
                    background: "#0096FF",
                    transition: "transform 0.1s",
                    transform: "translateY(-60px)",
                  }}
                  href={RouteType.Workout}
                  onClick={() => {
                    toggleScreenState("fetching", true);
                  }}
                >
                  <span>Lift!</span>
                </Link>
              </div>
            </>
          )}
        </>
      ) : (
        <div
          className="d-flex flex-column w-100 align-items-center"
          style={{ height: "80px", justifyContent: "space-between" }}
        >
          <span
            className="text-white"
            style={{
              fontFamily: "League+Spartan",
              fontWeight: 900,
              fontSize: "24px",
            }}
          >
            Welcome to LiftLedger!
          </span>
          <div style={{ width: "80px", height: "35px" }}>
            <div
              className="w-100 border border-0 text-white"
              style={{
                height: "30px",
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                borderRadius: "5px",
                background: "#004c81",
                transform: "translateY(5px)",
              }}
            />
            <button
              className="w-100 border border-0 text-white"
              style={{
                height: "30px",
                fontFamily: "League+Spartan",
                fontSize: "16px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                borderRadius: "5px",
                background: "#0096FF",
                transform: "translateY(-30px)",
                transition: "transform 0.1s",
                cursor: "pointer",
              }}
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
