import { useEffect, useMemo, useRef } from "react";
import { useMediaQuery } from "@/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router";
import { LogoSpinner } from "@/components/LogoSpinner";
import {
  useCompletedExercises,
  useMe,
  useBlock,
} from "@liftledger/api-client";
import { TemplateProvider } from "./TemplateProvider";
import { EMPTY_BLOCK } from "./emptyBlock";
import { templateFromBlock } from "./templateFromBlock";
import { EditorView } from "./EditorView";
import { EditBlockFooter } from "./EditBlockFooter";

export const EditBlock = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateFromId = searchParams.get("duplicateFrom");
  const { data: curUser } = useMe();
  const { isLoading: curBlockLoading, data: curBlock } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const isTabletOrLarger = useMediaQuery("(min-width: 600px)");

  useEffect(() => {
    if (isTabletOrLarger) navigate("/dashboard");
  }, [isTabletOrLarger, navigate]);

  const sourceBlock = useMemo(() => {
    if (!duplicateFromId || !curUser?.blocks) return null;
    return curUser.blocks.find((b) => b._id === duplicateFromId) ?? null;
  }, [duplicateFromId, curUser?.blocks]);

  if (!curUser) return <LogoSpinner />;

  if (duplicateFromId) {
    if (!sourceBlock || completedExercisesLoading || !completedExercises)
      return <LogoSpinner />;
  } else if (curBlockLoading) {
    return <LogoSpinner />;
  }

  const initialTemplate = duplicateFromId
    ? templateFromBlock(sourceBlock!, completedExercises!)
    : (curBlock ?? EMPTY_BLOCK);
  const initialWeekIdx = duplicateFromId ? 0 : (curBlock?.curWeekIdx ?? 0);

  return (
    <TemplateProvider
      key={duplicateFromId ?? "default"}
      initialTemplate={initialTemplate}
      initialWeekIdx={initialWeekIdx}
    >
      <div
        className="d-flex flex-column align-items-center h-100 w-100 overflow-y-scroll"
        style={{ padding: "15px 0px 65px" }}
        ref={pageContainerRef}
      >
        <EditorView />
      </div>
      <EditBlockFooter />
    </TemplateProvider>
  );
};
