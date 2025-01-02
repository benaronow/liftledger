import { Block, WeightType } from "@/types";
import { Box, Theme, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { selectCurUser, selectTemplate } from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { makeStyles } from "tss-react/mui";
import { useRouter } from "next/navigation";
import { InnerWidthContext } from "@/app/providers/innerWidthProvider";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  title: {
    fontFamily: "Gabarito",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  divider: {
    width: "105%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
  },
  actions: {
    display: "flex",
    width: "70%",
    justifyContent: "space-around",
  },
  submitButton: {
    border: "none",
    background: "transparent",
    fontFamily: "Gabarito",
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
    fontFamily: "Gabarito",
    fontSize: "16px",
    color: "#FF0000",
    fontWeight: 600,
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

const boxStyle = (theme: Theme) => ({
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
  maxWidth: `calc(${theme.breakpoints.values["sm"]}px - 20px)`,
  marginBottom: "10px",
});

export const CreateBlock = () => {
  const { classes } = useStyles();
  const curUser = useSelector(selectCurUser);
  const [editingDay, setEditingDay] = useState(0);
  const router = useRouter();
  const { innerWidth } = useContext(InnerWidthContext);
  const theme = useTheme();

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const template = useSelector(selectTemplate);
  const [block, setBlock] = useState<Block>(
    template
      ? { ...template, startDate: new Date() }
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
          <div className={classes.actions}>
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
      </Box>
    </div>
  );
};
