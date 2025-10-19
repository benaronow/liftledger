"use client";

import { Block, RouteType } from "@/app/types";
import { useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { useRouter } from "next/navigation";
import { ScreenStateContext } from "@/app/providers/ScreenStateProvider";
import { Spinner } from "../spinner";
import { useUser } from "@/app/providers/UserProvider";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100dvh",
    padding: "65px 15px 90px",
    overflow: "scroll",
  },
});

export const emptyBlock: Block = {
  name: "",
  startDate: new Date(),
  length: 0,
  initialWeek: [],
  weeks: [
    [
      {
        name: "Day 1",
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
            weightType: "",
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curDayIdx: 0,
  curWeekIdx: 0,
};

export const CreateBlock = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const { curUser, session } = useUser();
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

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div className={classes.container}>
      {editingDay === -1 ? (
        <EditWeek setEditingDay={setEditingDay} />
      ) : (
        <EditDay editingDay={editingDay} setEditingDay={setEditingDay} />
      )}
    </div>
  );
};
