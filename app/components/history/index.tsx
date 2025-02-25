"use client";

import { makeStyles } from "tss-react/mui";
import { Box, Theme, useTheme } from "@mui/material";
import dayjs from "dayjs";
import {
  selectCurUser,
  setEditingBlock,
  setTemplate,
} from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { ControlPointDuplicate } from "@mui/icons-material";
import { Block } from "@/types";
import { useAppDispatch } from "@/lib/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 120px)",
    padding: "10px 10px 0px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 50px)",
      overflow: "hidden",
    },
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
    textAlign: "center",
  },
  horizontalDivider: {
    width: "100%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  entry: {
    display: "flex",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    textAlign: "center",
  },
  completedBlockEntry: {
    justifyContent: "space-between",
  },
  duplicateButton: {
    color: "#0096FF",
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

const boxStyle = (theme: Theme) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  background: "white",
  outline: 0,
  border: "none",
  borderRadius: "25px 25px 25px 25px",
  padding: "0px 10px 10px 10px",
  width: "100%",
  maxWidth: `calc(${theme.breakpoints.values["sm"]}px - 20px)`,
  marginBottom: "10px",
  [theme.breakpoints.up("sm")]: {
    paddingTop: "5px",
    border: "solid",
    maxHeight: "100%",
    overflow: "scroll",
    boxShadow: "5px 5px 5px gray",
  },
  [theme.breakpoints.up("md")]: {
    maxHeight: "calc(100dvh - 70px)",
    overflow: "scroll",
  },
});

export const History = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const getCompletedDate = (block: Block) => {
    return block.weeks[block.length - 1].days[
      block.weeks[block.length - 1].days.length - 1
    ].completedDate;
  };

  const getTemplateFromBlock = (block: Block) => {
    return {
      name: `${block.name} (copy)`,
      startDate: undefined,
      length: block.length,
      weeks: [
        {
          number: 1,
          days: block.weeks[block.length - 1].days.map((day) => {
            return {
              name: day.name,
              hasGroup: day.hasGroup,
              groupName: day.groupName,
              exercises: day.exercises.map((exercise) => {
                return {
                  name: exercise.name,
                  apparatus: exercise.apparatus,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight,
                  weightType: exercise.weightType,
                  unilateral: exercise.unilateral,
                  note: "",
                  completed: false,
                };
              }),
              completed: false,
              completedDate: undefined,
            };
          }),
          completed: false,
        },
      ],
      completed: false,
    };
  };

  const handleCreateFromTemplate = (block: Block) => {
    dispatch(setTemplate(getTemplateFromBlock(block)));
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
        <Box sx={boxStyle}>
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
        </Box>
      )}
    </div>
  );
};
