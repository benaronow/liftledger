"use client";

import { RouteType } from "@/lib/types";
import { useTheme } from "@mui/material";
import { useEffect, useRef } from "react";
import { EditDay } from "./EditDay";
import { EditWeek } from "./EditWeek";
import { useRouter } from "next/navigation";
import { useScreenState } from "@/app/layoutContainer/ScreenStateProvider";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { SaveBlockDialog } from "./SaveBlockDialog";
import { QuitBlockDialog } from "./QuitBlockDialog";
import { useEditBlock } from "./EditBlockProvider";
import { useBlock } from "../layoutContainer/BlockProvider";
import { EditBlockFooter } from "./EditBlockFooter";

export const EditBlock = () => {
  const router = useRouter();
  const { curUser, session } = useUser();
  const { innerWidth, isFetching, toggleScreenState } = useScreenState();
  const theme = useTheme();
  const { curBlock, curBlockLoading, setTemplateBlock } = useBlock();
  const { editingDayIdx } = useEditBlock();
  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!curBlock) return;

    setTemplateBlock(curBlock);
  }, [curBlock]);

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Progress);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.Profile);
      router.prefetch(RouteType.History);
    }
  }, []);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  useEffect(() => {
    pageContainerRef.current?.scrollTo({ top: 0 });
  }, [editingDayIdx]);

  if (!curUser || (!curBlock && curBlockLoading) || isFetching)
    return <LogoSpinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center h-100 w-100 overflow-scroll"
        style={{ paddingBottom: "50px" }}
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
