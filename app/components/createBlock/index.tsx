"use client";

import { Block, WeightType } from "@/types";
import { Box } from "@mui/material";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { selectCurUser } from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    position: "absolute",
    top: "60px",
    width: "100%",
    padding: "10px 10px 10px 10px",
    background: "gray",
    minHeight: "calc(100vh - 60px)",
    alignItems: "center",
  },
});

const boxStyle = {
  background: "white",
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderRadius: "25px",
  padding: "10px 10px 10px 10px",
  width: "100%",
  maxWidth: "400px",
};

export const CreateBlock = () => {
  const { classes } = useStyles();
  const curUser = useSelector(selectCurUser);
  const [editingDay, setEditingDay] = useState(0);
  const [block, setBlock] = useState<Block>({
    name: "",
    startDate: new Date(),
    length: 0,
    weeks: [
      {
        number: 1,
        days: [
          {
            name: "Day 1",
            exercises: [
              {
                name: "",
                apparatus: "",
                musclesWorked: [],
                sets: 0,
                reps: [0],
                weight: [0],
                weightType: WeightType.Pounds,
                unilateral: false,
                prevSessionNote: "",
              },
            ],
          },
        ],
      },
    ],
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={classes.container}>
        <Box sx={boxStyle}>
          {editingDay === 0 ? (
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
        </Box>
      </div>
    </LocalizationProvider>
  );
};
