import { GrFormAdd } from "react-icons/gr";
import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()({
  addExercise: {
    width: "90%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  addExerciseSpacing: {
    width: "100%",
    height: "2px",
    background: "#0096FF",
  },
  addExerciseButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0096FF",
    color: "white",
    fontSize: "20px",
    padding: "0px",
    height: "20px",
    minWidth: "20px",
    border: "1px solid white",
    borderRadius: "20px",
    margin: "0px 10px",
  },
});

interface Props {
  onClick: () => void;
}

export const AddButton = ({ onClick }: Props) => {
  const { classes } = useStyles();

  return (
    <div className={classes.addExercise}>
      <div className={classes.addExerciseSpacing} />
      <button className={classes.addExerciseButton} onClick={onClick}>
        <GrFormAdd />
      </button>
      <div className={classes.addExerciseSpacing} />
    </div>
  );
};
