"use client";

import { RouteType } from "@/lib/types";
import { useTheme } from "@mui/material";
import { useEffect, useRef } from "react";
import { EditDay } from "./EditDay";
import { EditWeek } from "./EditWeek";
import { useRouter } from "next/navigation";
import { useScreenState } from "@/app/layoutProviders/ScreenStateProvider";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { useUser } from "@/app/layoutProviders/UserProvider";
import { FaSave } from "react-icons/fa";
import { ArrowBackIosNew } from "@mui/icons-material";
import { ActionsFooter, FooterAction } from "@/app/components/ActionsFooter";
import { SaveBlockDialog } from "./SaveBlockDialog";
import { useEditBlock } from "./EditBlockProvider";
import { useBlock } from "../layoutProviders/BlockProvider";

export const EditBlock = () => {
  const router = useRouter();
  const { curUser, session } = useUser();
  const { innerWidth, isFetching, toggleScreenState } = useScreenState();
  const theme = useTheme();
  const { curBlock, curBlockLoading, setTemplateBlock } = useBlock();
  const { editingDayIdx, setEditingDayIdx, setSaveDialogOpen, templateErrors } =
    useEditBlock();
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

  const footerActions: FooterAction[] = [
    (editingDayIdx !== -1
      ? {
          icon: <ArrowBackIosNew style={{ fontSize: "20px" }} />,
          label: "Return to week",
          onClick: () => setEditingDayIdx(-1),
          variant: "primary",
        }
      : {
          icon: <FaSave style={{ fontSize: "18px" }} />,
          label: "Save",
          onClick: () => setSaveDialogOpen(true),
          disabled: templateErrors.length > 0,
          variant: "primary",
        }) as FooterAction,
  ];

  if (!curUser || (!curBlock && curBlockLoading) || isFetching)
    return <LogoSpinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100 overflow-scroll"
        style={{ height: "100dvh", padding: "65px 15px 140px" }}
        ref={pageContainerRef}
      >
        {editingDayIdx === -1 ? <EditWeek /> : <EditDay />}
      </div>
      <SaveBlockDialog />
      <ActionsFooter actions={footerActions} />
    </>
  );
};
