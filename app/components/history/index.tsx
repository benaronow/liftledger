"use client";

import { useTheme } from "@mui/material";
import dayjs from "dayjs";
import { ControlPointDuplicate } from "@mui/icons-material";
import { Block, RouteType, Set } from "@/app/types";
import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { ScreenStateContext } from "@/app/providers/ScreenStateProvider";
import { Spinner } from "../spinner";
import { useUser } from "@/app/providers/UserProvider";
import { checkIsBlockDone } from "@/app/utils";
import { makeStyles } from "tss-react/mui";
import { useBlock } from "@/app/providers/BlockProvider";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
    padding: "65px 15px 85px",
    overflow: "scroll",
  },
  entry: {
    display: "flex",
    color: "white",
    fontFamily: "League+Spartan",
    fontSize: "14px",
    marginBottom: "15px",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    whiteSpace: "nowrap",
    background: "#58585b",
    borderRadius: "5px",
    border: "solid 5px #58585b",
    boxShadow: "0px 5px 10px #131314",
  },
  entryInfo: {
    background: "#131314",
    width: "100%",
    display: "flex",
    padding: "5px 10px",
    borderRadius: "5px",
    height: "35px",
    fontSize: "14px",
    alignItems: "center",
  },
  title: {
    fontWeight: 700,
    marginRight: "5px",
  },
  noBlockText: {
    fontFamily: "League+Spartan",
    fontSize: "16px",
    textAlign: "center",
  },
  completedBlockEntry: {
    justifyContent: "space-between",
  },
  duplicateButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "5px",
    background: "#0096FF",
    color: "white",
    border: "none",
    height: "35px",
    width: "35px",
    borderRadius: "5px",
  },
});

const getTemplateFromBlock = (block: Block) => ({
  name: block.name,
  startDate: new Date(),
  length: block.length,
  initialWeek: block.initialWeek,
  weeks: [
    block.weeks[block.length - 1].map((day) => {
      return {
        name: day.name,
        exercises: day.exercises.map((exercise) => {
          return {
            name: exercise.name,
            apparatus: exercise.apparatus,
            sets: exercise.sets.map((set: Set) => ({
              ...set,
              completed: false,
              note: "",
            })),
            weightType: exercise.weightType,
          };
        }),
        completedDate: undefined,
      };
    }),
  ],
  curDayIdx: 0,
  curWeekIdx: 0,
});

export const History = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const { curUser, session } = useUser();
  const { setTemplateBlock } = useBlock();
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
    setTemplateBlock(getTemplateFromBlock(block));
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
          <div className={classes.entryInfo}>
            <span className={classes.title}>{`${idx + 1}. ${block.name}`}</span>
            <span>{`(${dayjs(block.startDate).format("M/DD/YY")} -  ${
              getCompletedDate(block)
                ? dayjs(getCompletedDate(block)).format("M/DD/YY")
                : "N/A"
            })`}</span>
          </div>
          <button
            className={classes.duplicateButton}
            onClick={() => handleCreateFromTemplate(block)}
          >
            <ControlPointDuplicate />
          </button>
        </div>
      );
    });

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div className={`${classes.container}`}>
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
  );
};
