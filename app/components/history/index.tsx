"use client";

import { useTheme } from "@mui/material";
import dayjs from "dayjs";
import {
  selectCurUser,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { ControlPointDuplicate } from "@mui/icons-material";
import { Block, RouteType } from "@/types";
import { useAppDispatch } from "@/lib/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { getTemplateFromBlock } from "../utils";
import { useHistoryStyles } from "./useHistoryStyles";

export const History = () => {
  const { classes } = useHistoryStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();

  useEffect(() => {
    router.prefetch(RouteType.Add);
    router.prefetch(RouteType.Home);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.Progress);
  }, []);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const getCompletedDate = (block: Block) => {
    return block.weeks[block.length - 1].days[
      block.weeks[block.length - 1].days.length - 1
    ].completedDate;
  };

  const handleCreateFromTemplate = (block: Block) => {
    dispatch(setTemplate(getTemplateFromBlock(block, false)));
    dispatch(setEditingBlock(false));
    router.push("/create-block");
  };

  const completedBlocks = curUser?.blocks.map((block, idx) => {
    if (block.completed)
      return (
        <div
          key={idx}
          className={`${classes.entry} ${classes.completedBlockEntry}`}
        >
          <span>{`${block.name}: ${dayjs(block.startDate).format(
            "MM/DD/YYYY"
          )} -  ${
            getCompletedDate(block)
              ? dayjs(getCompletedDate(block)).format("MM/DD/YYYY")
              : "N/A"
          }`}</span>
          <div onClick={() => handleCreateFromTemplate(block)}>
            <ControlPointDuplicate className={classes.duplicateButton} />
          </div>
        </div>
      );
  });

  return (
    <div className={`${classes.container}`}>
      {((pathname === "/dashboard" &&
        innerWidth &&
        innerWidth > theme.breakpoints.values["sm"]) ||
        (pathname === "/history" &&
          innerWidth &&
          innerWidth < theme.breakpoints.values["sm"])) && (
        <>
          <span className={classes.title}>Completed Training Blocks</span>
          <div className={classes.horizontalDivider} />
          {!curUser && <span className={classes.noBlockText}>Loading</span>}
          {curUser &&
            (completedBlocks && completedBlocks[0] ? (
              completedBlocks
            ) : (
              <div
                className={`${classes.entry} ${classes.completedBlockEntry}`}
              >
                <span className={classes.noBlockText}>
                  No completed blocks yet
                </span>
              </div>
            ))}
        </>
      )}
    </div>
  );
};
