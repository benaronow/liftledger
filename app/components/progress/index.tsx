import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
});

export const Progress = () => {
  const { classes } = useStyles();

  return (
    <div className={`${classes.container}`}>
      <span>Feature coming soon!</span>
    </div>
  );
};