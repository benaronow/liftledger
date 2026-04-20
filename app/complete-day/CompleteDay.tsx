"use client";

import { RouteType } from "@/lib/types";
import { useEffect, useRef } from "react";
import { Spinner } from "@/app/components/spinner";
import { useScreenState } from "@/app/layoutProviders/ScreenStateProvider";
import { useUser } from "@/app/layoutProviders/UserProvider";
import { SetList } from "./SetList/SetList";
import { COLORS } from "@/lib/colors";
import { DeleteExerciseDialog } from "./DeleteExerciseDialog";
import { SubmitSetDialog } from "./SubmitSetDialog";
import { AddButton } from "@/app/components/AddButton";
import { AddExerciseDialog } from "./AddExerciseDialog";
import { FaTrash } from "react-icons/fa";
import { EditGymDialog } from "./EditGymDialog";
import { FinishDayDialog } from "./FinishDayDialog";
import { useCompleteDay } from "./CompleteDayProvider";
import { CompleteDayFooter } from "./CompleteDayFooter";
import { useRouter } from "next/navigation";

export const CompleteDay = () => {
  const router = useRouter();
  const { session } = useUser();
  const { isFetching, toggleScreenState } = useScreenState();
  const {
    exercises,
    setAddExerciseIdx,
    editing,
    setDeletingIdx,
    isExerciseComplete,
    currentExIdx,
  } = useCompleteDay();

  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Add);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.Profile);
      router.prefetch(RouteType.History);
      router.prefetch(RouteType.Progress);
    }
  }, []);

  useEffect(() => {
    if (!exercises.length) router.push("/dashboard");
  }, [exercises]);

  if (!exercises.length || isFetching) return <Spinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100 overflow-scroll"
        style={{ height: "100dvh", padding: "65px 15px 150px" }}
        ref={pageContainerRef}
      >
        <div className="d-flex flex-column align-items-center w-100">
          {exercises?.map((exercise, idx) => (
            <div
              className="d-flex flex-column align-items-center w-100 gap-2"
              key={idx}
            >
              {editing && <AddButton onClick={() => setAddExerciseIdx(idx)} />}
              <div
                id={exercise.name + exercise.apparatus}
                className={`d-flex flex-column align-items-center w-100 rounded overflow-hidden mb-${
                  idx === exercises.length - 1 ? "3" : "4"
                }`}
                style={{ boxShadow: "0px 5px 10px #131314" }}
              >
                <div
                  className="w-100 d-flex align-items-center justify-content-center px-2 position-relative"
                  style={{
                    background: isExerciseComplete(exercise)
                      ? COLORS.success
                      : COLORS.dark,
                  }}
                >
                  {exercise.addedOn && (
                    <span
                      className="position-absolute top-0 end-0 px-2 py-1 fw-semibold"
                      style={{
                        fontSize: "10px",
                        background: COLORS.container,
                        color: "white",
                        borderBottomLeftRadius: 6,
                        letterSpacing: "0.05em",
                      }}
                    >
                      ADD-ON
                    </span>
                  )}
                  {editing && exercise.addedOn && (
                    <button
                      className="border-0 rounded d-flex align-items-center justify-content-center position-absolute start-0 ms-2"
                      style={{
                        background: COLORS.danger,
                        color: "white",
                        width: 28,
                        height: 28,
                      }}
                      onClick={() => setDeletingIdx(idx)}
                    >
                      <FaTrash fontSize={12} />
                    </button>
                  )}
                  <div
                    className="w-100 d-flex flex-column align-items-center p-2 text-nowrap text-white fw-semibold"
                    style={{ fontFamily: "League+Spartan", fontSize: "16px" }}
                  >
                    <span>{exercise.name}</span>
                    <span>{exercise.apparatus}</span>
                  </div>
                </div>
                {!editing && (
                  <SetList
                    exercise={exercises[idx]}
                    isCurrentExercise={idx === currentExIdx}
                    containerRef={pageContainerRef}
                  />
                )}
              </div>
            </div>
          ))}
          {editing && (
            <AddButton onClick={() => setAddExerciseIdx(exercises.length)} />
          )}
        </div>
      </div>
      <AddExerciseDialog />
      <DeleteExerciseDialog />
      <SubmitSetDialog />
      <EditGymDialog />
      <FinishDayDialog />
      <CompleteDayFooter />
    </>
  );
};
