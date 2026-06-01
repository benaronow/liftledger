import { useEffect, useRef, useState } from "react";
import { LogoSpinner } from "@/components/LogoSpinner";
import { useCurrentDay } from "@liftledger/api-client";
import { CompleteDayFooter } from "./CompleteDayFooter";
import { useNavigate } from "react-router";
import { ExerciseList } from "./ExerciseList/ExerciseList";

export const CompleteDay = () => {
  const navigate = useNavigate();
  const { exercises } = useCurrentDay();
  const [isEditing, setIsEditing] = useState(false);

  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exercises.length) navigate("/dashboard");
  }, [exercises, navigate]);

  if (!exercises.length) return <LogoSpinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center h-100 w-100 overflow-scroll"
        style={{ padding: "15px 0px 65px" }}
        ref={pageContainerRef}
      >
        <ExerciseList
          exercises={exercises}
          isEditing={isEditing}
          containerRef={pageContainerRef}
        />
      </div>
      <CompleteDayFooter isEditing={isEditing} setIsEditing={setIsEditing} />
    </>
  );
};
