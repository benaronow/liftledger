"use client";

import { Block, RouteType } from "@/lib/types";
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
import { ActionsHeader, HeaderAction } from "../components/ActionsHeader";

export const CreateBlock = () => {
  const router = useRouter();
  const { curUser, session } = useUser();
  const {
    curBlock,
    templateBlock,
    unsetTemplateBlock,
    setEditingWeekIdx,
    createBlock,
    editBlock,
  } = useBlock();
  const { innerWidth, isFetching, toggleScreenState } = useScreenState();
  const theme = useTheme();
  const [editingDay, setEditingDay] = useState(-1);

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
    const blockToSubmit: Block = curBlock
      ? templateBlock
      : {
          ...templateBlock,
          initialWeek: templateBlock.weeks[0],
        };

    toggleScreenState("fetching", true);
    if (curBlock) {
      editBlock(blockToSubmit);
    } else {
      createBlock(blockToSubmit);
    }
    unsetTemplateBlock();
    setEditingWeekIdx(0);
    router.push("/dashboard");
  };

  const headerActions: HeaderAction[] = useMemo(
    () => [
      {
        icon: <ArrowBackIosNew style={{ fontSize: "20px" }} />,
        label: "Return to week",
        onClick: () => setEditingDay(-1),
        side: editingDay !== -1 ? "left" : "",
      },
      {
        icon: <FaSave />,
        label: "Save",
        onClick: handleSubmit,
        side: "right",
      },
    ],
    [setEditingDay, handleSubmit]
  );

  if (!curUser || isFetching) return <Spinner />;

  return (
    <>
      <ActionsHeader actions={headerActions} />
      <div
        className="d-flex flex-column align-items-center w-100 overflow-scroll"
        style={{ height: "100dvh", padding: "105px 15px 90px" }}
      >
        {editingDay === -1 ? (
          <EditWeek setEditingDay={setEditingDay} />
        ) : (
          <EditDay editingDay={editingDay} />
        )}
      </div>
    </>
  );
};
