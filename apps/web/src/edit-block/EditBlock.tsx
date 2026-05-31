import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { EditDay } from "./EditDay";
import { EditWeek } from "./EditWeek";
import { useNavigate } from "react-router";
import { LogoSpinner } from "@/components/LogoSpinner";
import { useMe, useUserBlock } from "@liftledger/api-client";
import { SaveBlockDialog } from "./SaveBlockDialog";
import { QuitBlockDialog } from "./QuitBlockDialog";
import { useEditBlock } from "./EditBlockProvider";
import { EditBlockFooter } from "./EditBlockFooter";

export const EditBlock = () => {
  const navigate = useNavigate();
  const { data: curUser } = useMe();
  const { isLoading: curBlockLoading, data: curBlock } = useUserBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const isTabletOrLarger = useMediaQuery("(min-width: 600px)");
  const { editingDayIdx } = useEditBlock();
  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTabletOrLarger) navigate("/dashboard");
  }, [isTabletOrLarger, navigate]);

  useEffect(() => {
    pageContainerRef.current?.scrollTo({ top: 0 });
  }, [editingDayIdx]);

  if (!curUser || (!curBlock && curBlockLoading)) return <LogoSpinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center h-100 w-100 overflow-y-scroll"
        style={{ padding: "15px 0px 65px" }}
        ref={pageContainerRef}
      >
        {editingDayIdx === -1 ? <EditWeek /> : <EditDay />}
      </div>
      <SaveBlockDialog />
      <QuitBlockDialog />
      <EditBlockFooter />
    </>
  );
};
