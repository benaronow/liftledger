"use client";

import { RouteType } from "@/lib/types";
import { useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { useRouter } from "next/navigation";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { Spinner } from "../components/spinner";
import { useUser } from "@/app/providers/UserProvider";
import { useBlock } from "../providers/BlockProvider";
import { FaSave } from "react-icons/fa";
import { ArrowBackIosNew } from "@mui/icons-material";
import { ActionsFooter, FooterAction } from "../components/ActionsFooter";

export const CreateBlock = () => {
  const router = useRouter();
  const { curUser, session } = useUser();
  const {
    curBlock,
    templateBlock,
    unsetTemplateBlock,
    editingWeekIdx,
    setEditingWeekIdx,
    createBlock,
    updateBlock,
  } = useBlock();
  const { innerWidth, isFetching, toggleScreenState } = useScreenState();
  const theme = useTheme();
  const [editingDayIdx, setEditingDayIdx] = useState(-1);

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

  const handleSubmit = () => {
    toggleScreenState("fetching", true);
    if (curBlock) {
      updateBlock(templateBlock);
    } else {
      createBlock(templateBlock);
    }
    unsetTemplateBlock();
    setEditingWeekIdx(0);
    router.push("/dashboard");
  };

  const templateErrors = useMemo(() => {
    const errors: string[] = [];
    if (!templateBlock.name) errors.push("Block name missing");
    if (templateBlock.length === 0) errors.push("Block length too short");
    for (const day of templateBlock.weeks[editingWeekIdx]) {
      for (const exercise of day.exercises) {
        if (
          !exercise.name ||
          !exercise.apparatus ||
          !exercise.weightType ||
          exercise.sets.length === 0
        )
          errors.push(day.name);
      }
    }
    return errors;
  }, [templateBlock, editingWeekIdx]);

  const headerActions: FooterAction[] = [
    ...(editingDayIdx !== -1
      ? [
          {
            icon: <ArrowBackIosNew style={{ fontSize: "20px" }} />,
            label: "Return to week",
            onClick: () => setEditingDayIdx(-1),
            variant: "primary",
          } as FooterAction,
        ]
      : []),
    ...[
      {
        icon: <FaSave style={{ fontSize: "18px" }} />,
        label: "Save",
        onClick: handleSubmit,
        disabled: templateErrors.length > 0,
        variant: "primary",
      } as FooterAction,
    ],
  ];

  if (!curUser || isFetching) return <Spinner />;

  return (
    <>
      <div
        className="d-flex flex-column align-items-center w-100 overflow-scroll"
        style={{ height: "100dvh", padding: "65px 15px 140px" }}
      >
        {editingDayIdx === -1 ? (
          <EditWeek setEditingDay={setEditingDayIdx} errors={templateErrors} />
        ) : (
          <EditDay editingDayIdx={editingDayIdx} />
        )}
      </div>
      <ActionsFooter actions={headerActions} />
    </>
  );
};
