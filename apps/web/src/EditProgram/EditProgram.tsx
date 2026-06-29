import { useEffect, useMemo, useRef } from "react";
import { useMediaQuery } from "@/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router";
import { LogoSpinner } from "@/components/LogoSpinner";
import {
  useCompletedExercises,
  useMe,
  useProgram,
} from "@liftledger/api-client";
import { TemplateProvider } from "./TemplateProvider";
import { EMPTY_PROGRAM } from "./emptyProgram";
import { templateFromProgram } from "./templateFromProgram";
import { EditorView } from "./EditorView";
import { EditProgramFooter } from "./EditProgramFooter";

export const EditProgram = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateFromId = searchParams.get("duplicateFrom");
  const { data: curUser } = useMe();
  const { isLoading: curProgramLoading, data: curProgram } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isTabletOrLarger = useMediaQuery("(min-width: 600px)");

  useEffect(() => {
    if (isTabletOrLarger) navigate("/dashboard");
  }, [isTabletOrLarger, navigate]);

  const sourceProgram = useMemo(() => {
    if (!duplicateFromId || !curUser?.programs) return null;
    return curUser.programs.find((b) => b._id === duplicateFromId) ?? null;
  }, [duplicateFromId, curUser?.programs]);

  if (!curUser) return <LogoSpinner />;

  if (duplicateFromId) {
    if (!sourceProgram || completedExercisesLoading || !completedExercises)
      return <LogoSpinner />;
  } else if (curProgramLoading) {
    return <LogoSpinner />;
  }

  const initialTemplate = duplicateFromId
    ? templateFromProgram(sourceProgram!, completedExercises!)
    : (curProgram ?? EMPTY_PROGRAM);
  const initialRotationIdx = duplicateFromId ? 0 : (curProgram?.curRotationIdx ?? 0);

  return (
    <TemplateProvider
      key={duplicateFromId ?? "default"}
      initialTemplate={initialTemplate}
      initialRotationIdx={initialRotationIdx}
    >
      <div
        className="d-flex flex-column align-items-center h-100 w-100 overflow-y-scroll"
        style={{ padding: "15px 0px 65px" }}
        ref={pageContainerRef}
      >
        <EditorView />
      </div>
      <EditProgramFooter />
    </TemplateProvider>
  );
};
