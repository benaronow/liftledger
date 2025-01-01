import { Block, WeightType } from "@/types";
import { Box } from "@mui/material";
import { useState } from "react";
import { selectCurUser } from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "Gabarito",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  divider: {
    width: "105%",
    height: "1.5px",
    background: "black",
    marginBottom: "10px",
  },
  submitButton: {
    border: "none",
    borderRadius: "5px",
    background: "#0096FF",
    color: "white",
    fontFamily: "Gabarito",
    fontSize: "16px",
    height: "35px",
  },
});

const boxStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "white",
  outline: 0,
  border: "none",
  borderRadius: "25px 25px 25px 25px",
  padding: "0px 10px 0px 10px",
  width: "100%",
  maxWidth: "400px",
  marginBottom: "10px",
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

  return (
    <div className={classes.container}>
      <Box sx={boxStyle}>
        <span className={classes.title}>Create Training Block</span>
        <div className={classes.divider}></div>
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
        {editingDay === 0 && (
          <button
            className={classes.submitButton}
            form="create-block-form"
            type="submit"
            disabled={editingDay !== 0}
          >
            Save Block
          </button>
        )}
      </Box>
    </div>
  );
};
