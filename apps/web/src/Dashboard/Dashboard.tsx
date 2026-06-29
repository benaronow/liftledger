import { useMe, useProgram } from "@liftledger/api-client";
import dayjs from "dayjs";
import { Session, Exercise, Set } from "@liftledger/shared";
import { LogoSpinner } from "@/components/LogoSpinner";
import { Link } from "react-router";
import { RouteType } from "@/routeTypes";

export const Dashboard = () => {
  const { data: curUser } = useMe();
  const { data: curProgram, isLoading: curProgramLoading } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );

  const getExerciseCompleted = (exercise: Exercise) => {
    return exercise.sets.reduce(
      (accSet: boolean, curSet: Set) => accSet && curSet.completed,
      true,
    );
  };

  const getTotalWeight = (type: "lbs" | "kgs") => {
    return `${curProgram?.rotations.reduce((accRotation: number, curRotation: Session[]) => {
      return (
        accRotation +
        curRotation.reduce((accSession: number, curSession: Session) => {
          return (
            accSession +
            curSession.exercises.reduce((accEx: number, curEx: Exercise) => {
              return (
                accEx +
                curEx.sets.reduce(
                  (accWeight: number, curSet: Set) =>
                    accWeight +
                    (curSet.completed
                      ? (curSet.reps ?? 0) *
                        (curSet.weight ?? 0) *
                        (curEx.weightType === type
                          ? 1
                          : curEx.weightType === "kgs"
                            ? 2.205
                            : 0.454)
                      : 0),
                  0,
                )
              );
            }, 0)
          );
        }, 0)
      );
    }, 0)} lbs`;
  };

  const getDaysSinceLast = () => {
    if (!curProgram?.rotations[0][0].completedDate) return 0;

    let lastWorkoutDate = new Date(0);
    curProgram?.rotations.forEach((rotation) =>
      rotation.forEach((session) =>
        session.exercises.forEach((exercise) => {
          const completionDate = session.completedDate
            ? new Date(session.completedDate)
            : new Date();
          if (
            getExerciseCompleted(exercise) &&
            lastWorkoutDate < completionDate
          ) {
            lastWorkoutDate = completionDate;
          }
        }),
      ),
    );
    const timeDifference =
      new Date().getTime() - new Date(lastWorkoutDate).getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  };

  const curSessionName = curProgram
    ? curProgram.rotations[curProgram.curRotationIdx].find((session) => !session.completedDate)
        ?.name || "Unavailable"
    : "Unavailable";

  const metricValueMap = [
    {
      metric: "Start Date",
      value: dayjs(curProgram?.startDate).format("MM/DD/YYYY"),
    },
    {
      metric: "Program Length:",
      value: `${curProgram?.length} rotation${
        (curProgram?.length || 0) > 1 ? "s" : ""
      }`,
    },
    { metric: "Rotation:", value: `Rotation ${(curProgram?.curRotationIdx || 0) + 1}` },
    { metric: "Session:", value: curSessionName },
    { metric: "Days Since Last Workout:", value: getDaysSinceLast() },
    { metric: "Total Weight Lifted:", value: getTotalWeight("lbs") },
  ];

  if (!curUser || curProgramLoading) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-evenly h-100 w-100"
      style={{ padding: "15px 0px" }}
    >
      <div
        className="d-flex flex-column align-items-center text-white"
        style={{ fontFamily: "League+Spartan", fontWeight: 900 }}
      >
        {curUser && !curProgram ? (
          <span
            className="text-nowrap"
            style={{ fontSize: "16px", marginBottom: "5px" }}
          >
            Create a training program to get started!
          </span>
        ) : (
          <>
            <span
              className="text-nowrap"
              style={{ fontSize: "16px", marginBottom: "5px" }}
            >
              Currently Completing:
            </span>
            <span style={{ fontSize: "24px" }}>{curProgram?.name}</span>
          </>
        )}
      </div>
      {curProgram && (
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
              to={RouteType.Workout}
            >
              <span>Lift!</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
