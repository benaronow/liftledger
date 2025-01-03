import { Block, WeightType } from "@/types";
import { Box, Theme, useTheme } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { selectCurUser, selectTemplate } from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { EditDay } from "./editDay";
import { EditWeek } from "./editWeek";
import { makeStyles } from "tss-react/mui";
import { usePathname, useRouter } from "next/navigation";
import { InnerSizeContext } from "@/app/providers/innerSizeProvider";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "calc(100dvh - 120px)",
    padding: "10px 10px 10px 10px",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      background: "lightgray",
      height: "calc(100dvh - 50px)",
      overflow: "visible",
    },
  },
  title: {
    fontFamily: "League+Spartan",
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
  [theme.breakpoints.up("sm")]: {
    border: "solid",
    borderWidth: "5px",
    padding: "10px 10px 10px 10px",
  },
});

export const CreateBlock = () => {
  const { classes } = useStyles();
  const curUser = useSelector(selectCurUser);
  const [editingDay, setEditingDay] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { innerWidth } = useContext(InnerSizeContext);
  const theme = useTheme();
  const saveRef = useRef<HTMLDivElement>(null);

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
              groupName: '',
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
        <Box sx={boxStyle}>
          <span className={classes.title}>Create Training Block</span>
          <div className={classes.divider}></div>
          {editingDay === 0 ? (
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
          {editingDay === 0 && (
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
        </Box>
      )}
    </div>
  );
};
