import { useEffect, useRef, useState } from "react";
import { LogoSpinner } from "@/components/LogoSpinner";
import { useCurrentSession } from "@liftledger/api-client";
import { CompleteSessionFooter } from "./CompleteSessionFooter";
import { useNavigate } from "react-router";
import { ExerciseList } from "./ExerciseList/ExerciseList";

export const CompleteSession = () => {
  const navigate = useNavigate();
  const { exercises } = useCurrentSession();
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
      <CompleteSessionFooter isEditing={isEditing} setIsEditing={setIsEditing} />
    </>
  );
};
