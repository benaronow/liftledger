import { makeStyles } from "tss-react/mui";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { selectCurUser } from "@/lib/features/user/userSlice";
import { useSelector } from "react-redux";

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
    justifyContent: "center",
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
  const curUser = useSelector(selectCurUser);

  const completedBlocks = curUser?.blocks.map((block, idx) => {
    if (block.completed)
      return (
        <div
          key={idx}
          className={`${classes.entry} ${classes.completedBlockEntry}`}
        >
          <span>{`${block.name}: Started ${dayjs(block.startDate).format(
            "MM-DD-YYYY"
          )}, ${block.length} weeks`}</span>
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
