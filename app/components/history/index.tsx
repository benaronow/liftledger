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
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { useHistoryStyles } from "./useHistoryStyles";
import { Spinner } from "../spinner";
import { LoginContext } from "@/app/providers/loginProvider";
import { checkIsBlockDone, getTemplateFromBlock } from "@/app/utils";

export const History = () => {
  const { classes } = useHistoryStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const { session } = useContext(LoginContext);
  const { innerWidth, isFetching, toggleScreenState } =
    useContext(ScreenStateContext);
  const theme = useTheme();

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Add);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.Profile);
      router.prefetch(RouteType.Progress);
    }
  }, []);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const getCompletedDate = (block: Block) => {
    return block.weeks[block.length - 1][
      block.weeks[block.length - 1].length - 1
    ].completedDate;
  };

  const handleCreateFromTemplate = (block: Block) => {
    dispatch(setTemplate(getTemplateFromBlock(block, false)));
    dispatch(setEditingBlock(false));
    router.push("/create-block");
  };

  const completedBlocks = curUser?.blocks
    .filter((block) => checkIsBlockDone(block))
    .map((block, idx) => {
      return (
        <div
          key={idx}
          className={`${classes.entry} ${classes.completedBlockEntry}`}
        >
          <span className={classes.title}>{`${idx + 1}. ${block.name}`}</span>
          <div className={classes.middlePad} />
          <span>{`${dayjs(block.startDate).format("M/DD/YYYY")} -  ${
            getCompletedDate(block)
              ? dayjs(getCompletedDate(block)).format("M/DD/YYYY")
              : "N/A"
          }`}</span>
          <div onClick={() => handleCreateFromTemplate(block)}>
            <ControlPointDuplicate className={classes.duplicateButton} />
          </div>
        </div>
      );
    });

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div className={`${classes.container}`}>
      <div className={classes.box}>
        {completedBlocks && completedBlocks[0] ? (
          completedBlocks
        ) : (
          <div className={`${classes.entry} ${classes.completedBlockEntry}`}>
            <span className={`${classes.noBlockText} ${classes.title}`}>
              No completed blocks yet
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
