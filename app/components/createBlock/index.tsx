"use client";

import { Block, RouteType, WeightType } from "@/types";
import { useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import {
  selectCurUser,
  selectEditingBlock,
  selectTemplate,
} from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { useRouter } from "next/navigation";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";
import { useCreateBlockStyles } from "./useCreateBlockStyles";
import { Spinner } from "../spinner";
import { LoginContext } from "@/app/providers/loginProvider";

export const emptyBlock: Block = {
  name: "",
  startDate: new Date(),
  length: 0,
  initialWeek: { number: 0, days: [], completed: true },
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
              sets: [
                {
                  reps: 0,
                  weight: 0,
                  completed: false,
                  note: "",
                },
              ],
              weightType: WeightType.Pounds,
              unilateral: false,
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
  curDayIdx: 0,
  curWeekIdx: 0,
};

export const CreateBlock = () => {
  const { classes } = useCreateBlockStyles();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();
  const { session } = useContext(LoginContext);
  const { innerWidth, isFetching, toggleScreenState } =
    useContext(ScreenStateContext);
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

  const template = useSelector(selectTemplate);
  const editingBlock = useSelector(selectEditingBlock);
  const [block, setBlock] = useState<Block>(
    template
      ? {
          ...template,
          startDate: editingBlock ? template.startDate : new Date(),
        }
      : emptyBlock
  );

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div className={classes.container}>
      <div className={classes.box}>
        {editingDay === -1 ? (
          <EditWeek
            uid={curUser?._id || ""}
            block={block}
            setBlock={setBlock}
            setEditingDay={setEditingDay}
          />
        ) : (
          <EditDay
            block={block}
            setBlock={setBlock}
            editingDay={editingDay}
            setEditingDay={setEditingDay}
          />
        )}
      </div>
    </div>
  );
};
