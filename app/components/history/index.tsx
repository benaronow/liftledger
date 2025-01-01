import { makeStyles } from "tss-react/mui";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { selectCurUser, setTemplate } from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";
import { ControlPointDuplicate } from "@mui/icons-material";
import { Block } from "@/types";
import { useAppDispatch } from "@/lib/hooks";
import { useRouter } from "next/navigation";

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
    height: "2px",
    background: "black",
    marginBottom: "10px",
  },
  entry: {
    display: "flex",
    fontFamily: "Gabarito",
    fontSize: "16px",
    marginBottom: "10px",
    width: "100%",
  },
  noBlockText: {
    marginBottom: "10px",
    fontFamily: "Gabarito",
    fontSize: "16px",
  },
  completedBlockEntry: {
    justifyContent: "space-between",
  },
  duplicateButton: {
    color: "#0096FF",
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

export const History = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const curUser = useSelector(selectCurUser);
  const router = useRouter();

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
      <Box sx={boxStyle}>
        <span className={classes.title}>Completed Training Blocks</span>
        <div className={classes.divider} />
        {!curUser && <span className={classes.noBlockText}>Loading</span>}
        {curUser &&
          (completedBlocks && completedBlocks[0] ? (
            completedBlocks
          ) : (
            <div className={`${classes.entry} ${classes.completedBlockEntry}`}>
              <span>No completed blocks yet</span>
            </div>
          ))}
      </Box>
    </div>
  );
};
