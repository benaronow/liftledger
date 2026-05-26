"use client";

import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useRef } from "react";
import { EditDay } from "./EditDay";
import { EditWeek } from "./EditWeek";
import { useRouter } from "next/navigation";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { SaveBlockDialog } from "./SaveBlockDialog";
import { QuitBlockDialog } from "./QuitBlockDialog";
import { useEditBlock } from "./EditBlockProvider";
import { useBlock } from "../layoutContainer/BlockProvider";
import { EditBlockFooter } from "./EditBlockFooter";

export const EditBlock = () => {
  const router = useRouter();
  const { curUser } = useUser();
  const theme = useTheme();
  const isTabletOrLarger = useMediaQuery(theme.breakpoints.up("sm"));
  const { curBlock, curBlockLoading, setTemplateBlock } = useBlock();
  const { editingDayIdx } = useEditBlock();
  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!curBlock) return;

    setTemplateBlock(curBlock);
  }, [curBlock]);

  useEffect(() => {
    if (isTabletOrLarger) router.push("/dashboard");
  }, [isTabletOrLarger]);

  useEffect(() => {
    pageContainerRef.current?.scrollTo({ top: 0 });
  }, [editingDayIdx]);

  if (!curUser || (!curBlock && curBlockLoading)) return <LogoSpinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center h-100 w-100 overflow-hidden"
        style={{
          paddingBottom: "50px",
        }}
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
