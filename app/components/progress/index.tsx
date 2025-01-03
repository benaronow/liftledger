import { makeStyles } from "tss-react/mui";
// import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
// import { useContext } from "react";
// import { LoginContext } from "@/app/providers/loginProvider";


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
  // const { curUser } = useContext(LoginContext);

  // const createData = () => {
    
  // }

  // const data = 
  // const table = useMaterialReactTable({});

  return (
    <div className={`${classes.container}`}>
      <span>Feature coming soon!</span>
    </div>
  );
};
