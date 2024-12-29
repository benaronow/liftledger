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
  title: {
    fontFamily: "Gabarito",
    fontWeight: 900,
    fontSize: "22px",
  },
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
  submitButton: {
    width: "100%",
    height: "40px",
    borderRadius: "0px 0px 20px 20px",
    border: "none",
    background: "#0096FF",
    color: "white",
    fontFamily: "Gabarito",
    fontWeight: 600,
    fontSize: "18px",
  },
  submitButtonDisabled: {
    background: "#9ED7FF",
  },
});

const titleBoxStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "lightgray",
  borderWidth: "5px",
  borderRadius: "25px 25px 0px 0px",
  width: "100%",
  height: "50px",
  maxWidth: "400px",
  marginBottom: "-5px",
};

const formBoxStyle = {
  background: "white",
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderWidth: "5px",
  padding: "10px 10px 10px 10px",
  width: "100%",
  maxWidth: "400px",
};

const saveBoxStyle = {
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderWidth: "5px",
  borderRadius: "0px 0px 25px 25px",
  width: "100%",
  height: "50px",
  maxWidth: "400px",
  marginTop: "-5px",
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
        <Box sx={titleBoxStyle}>
          <span className={classes.title}>Create Training Block</span>
        </Box>
        <Box sx={formBoxStyle}>
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
        <Box sx={saveBoxStyle}>
          <button
            className={`${classes.submitButton} ${
              editingDay !== 0 && classes.submitButtonDisabled
            }`}
            form="create-block-form"
            type="submit"
            disabled={editingDay !== 0}
          >
            Save Plan
          </button>
        </Box>
      </div>
    </LocalizationProvider>
  );
};
