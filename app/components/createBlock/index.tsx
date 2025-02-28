"use client";

import { Block, RouteType, WeightType } from "@/types";
import { useTheme } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import {
  selectCurUser,
  selectEditingBlock,
  selectTemplate,
} from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { makeStyles } from "tss-react/mui";
import { usePathname, useRouter } from "next/navigation";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { Overlay } from "../overlay";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 60px)",
    padding: "0px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 60px)",
      overflow: "hidden",
    },
  },
  title: {
    fontFamily: "League+Spartan",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  horizontalDivider: {
    width: "100%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
    border: "solid",
    borderWidth: "1px",
  },
  actions: {
    display: "flex",
    width: "70%",
    justifyContent: "space-around",
  },
  submitButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#0096FF",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
  clearButton: {
    border: "none",
    background: "transparent",
    fontFamily: "League+Spartan",
    fontSize: "16px",
    color: "#FF0000",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export const CreateBlock = () => {
  const { classes } = useStyles();
  const curUser = useSelector(selectCurUser);
  const [editingDay, setEditingDay] = useState(-1);
  const router = useRouter();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();
  const saveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    router.prefetch(RouteType.Progress);
    router.prefetch(RouteType.Home);
    router.prefetch(RouteType.Profile);
    router.prefetch(RouteType.History);
  }, []);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const template = useSelector(selectTemplate);
  const editingBlock = useSelector(selectEditingBlock);
  const [block, setBlock] = useState<Block>(
    template
      ? {
          ...template,
          startDate: editingBlock ? template.startDate : new Date(),
        }
      : {
          name: "",
          startDate: new Date(),
          length: 0,
          weeks: [
            {
              number: 1,
              days: [
                {
                  name: "Day 1",
                  hasGroup: false,
                  exercises: [
                    {
                      name: "",
                      apparatus: "",
                      sets: 0,
                      reps: [0],
                      weight: [0],
                      weightType: WeightType.Pounds,
                      unilateral: false,
                      note: "",
                      completed: false,
                    },
                  ],
                  completed: false,
                  completedDate: undefined,
                },
              ],
              completed: false,
            },
          ],
          completed: false,
        }
  );

  const handleClear = () => {
    setBlock({
      name: "",
      startDate: new Date(),
      length: 0,
      weeks: [
        {
          number: 1,
          days: [
            {
              name: "Day 1",
              hasGroup: false,
              groupName: "",
              exercises: [
                {
                  name: "",
                  apparatus: "",
                  sets: 0,
                  reps: [0],
                  weight: [0],
                  weightType: WeightType.Pounds,
                  unilateral: false,
                  note: "",
                  completed: false,
                },
              ],
              completed: false,
              completedDate: undefined,
            },
          ],
          completed: false,
        },
      ],
      completed: false,
    });
  };

  return (
    <div className={classes.container}>
      <Overlay />
      {((pathname === "/dashboard" &&
        innerWidth &&
        innerWidth > theme.breakpoints.values["sm"]) ||
        (pathname === "/create-block" &&
          innerWidth &&
          innerWidth < theme.breakpoints.values["sm"])) && (
        <>
          <span className={classes.title}>Create Training Block</span>
          <div className={classes.horizontalDivider}></div>
          {editingDay === -1 ? (
            <EditWeek
              uid={curUser?._id || ""}
              block={block}
              setBlock={setBlock}
              setEditingDay={setEditingDay}
              saveRef={saveRef}
            />
          ) : (
            <EditDay
              block={block}
              setBlock={setBlock}
              editingDay={editingDay}
              setEditingDay={setEditingDay}
            />
          )}
          {editingDay === -1 && (
            <div className={classes.actions} ref={saveRef}>
              <button
                className={classes.submitButton}
                form="create-block-form"
                type="submit"
              >
                Save Block
              </button>
              <button className={classes.clearButton} onClick={handleClear}>
                Clear
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
