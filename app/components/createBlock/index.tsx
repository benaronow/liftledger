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
import { usePathname, useRouter } from "next/navigation";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";
import { useCreateBlockStyles } from "./useCreateBlockStyles";

export const CreateBlock = () => {
  const { classes } = useCreateBlockStyles();
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
      {((pathname === "/dashboard" &&
        innerWidth &&
        innerWidth > theme.breakpoints.values["sm"]) ||
        (pathname === "/create-block" &&
          innerWidth &&
          innerWidth < theme.breakpoints.values["sm"])) && (
        <div className={classes.box}>
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
          <div className={classes.actions} ref={saveRef}>
            <div className={classes.buttonContainer}>
              <div
                className={`${classes.actionButton} ${classes.submitButtonBottom}`}
              />
              <button
                className={`${classes.actionButton} ${classes.submitButtonTop}`}
                form="create-block-form"
                type="submit"
                onClick={() => editingDay !== -1 && setEditingDay(-1)}
              >
                {`Save ${editingDay === -1 ? "Block" : "Day"}`}
              </button>
            </div>
            <div className={classes.buttonContainer}>
              <div
                className={`${classes.actionButton} ${classes.clearButtonBottom}`}
              />
              <button
                className={`${classes.actionButton} ${classes.clearButtonTop}`}
                onClick={handleClear}
              >
                {`Clear ${editingDay === -1 ? "Block" : "Day"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
