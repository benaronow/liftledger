import { makeStyles } from "tss-react/mui";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useContext, useMemo } from "react";
import { LoginContext } from "@/app/providers/loginProvider";
import { DayWithSubWeek, ExerciseWithSubWeek, TableData, Week } from "@/types";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    overflow: "scroll",
  },
});

export const Progress = () => {
  const { classes } = useStyles();
  const { curUser } = useContext(LoginContext);

  const laterSession = (curWeek: Week, curDay: number) => {
    const curDayDetail = curWeek.days[curDay];
    for (let i = curDay + 1; i < curWeek.days.length; i++) {
      const laterSessionDetail = curWeek.days[i];
      if (
        curDayDetail.hasGroup &&
        laterSessionDetail.hasGroup &&
        curDayDetail.groupName === laterSessionDetail.groupName
      )
        return i;
    }
    return 0;
  };

  const prevSession = (curWeek: Week, curDay: number) => {
    const curDayDetail = curWeek.days[curDay];
    for (let i = 0; i < curDay; i++) {
      const prevSessionDetail = curWeek.days[i];
      if (
        curDayDetail.hasGroup &&
        prevSessionDetail.hasGroup &&
        curDayDetail.groupName === prevSessionDetail.groupName
      )
        return i;
    }
    return undefined;
  };

  const getAllDayData = () => {
    const exWeek = curUser?.curBlock?.weeks[0];
    return (
      exWeek?.days
        .map((_, idx) => {
          const dayData: DayWithSubWeek[] = [];
          const laterSessionIdx = laterSession(exWeek, idx);
          const prevSessionIdx = prevSession(exWeek, idx);
          if (prevSessionIdx !== undefined || !curUser?.curBlock)
            return dayData;
          for (let i = 0; i < curUser.curBlock.weeks.length; i++) {
            const week = curUser.curBlock.weeks[i];
            if (laterSessionIdx) {
              dayData.push({ ...week.days[idx], week: i, sub: 1 });
              dayData.push({ ...week.days[laterSessionIdx], week: i, sub: 2 });
            } else {
              dayData.push({ ...week.days[idx], week: i });
            }
          }
          return dayData;
        })
        .filter((dayData) => dayData.length > 0) || []
    );
  };

  const getExerciseData = (dayData: DayWithSubWeek[]) => {
    if (!dayData.length) return [];
    const exDay = dayData[0];
    return exDay?.exercises.map((exercise) => {
      const exerciseData: ExerciseWithSubWeek[] = [];
      for (const day of dayData) {
        const exerciseMatch = day.exercises.find(
          (ddExercise) => ddExercise.name === exercise.name
        );
        if (exerciseMatch)
          exerciseData.push({ ...exerciseMatch, week: day.week, sub: day.sub });
      }
      return exerciseData;
    });
  };

  const getTableData = (exerciseData: ExerciseWithSubWeek[]) => {
    if (!exerciseData.length) return [];
    const tableData: TableData = {
      name: `${exerciseData[0].name} (${exerciseData[0].apparatus})`,
    };
    exerciseData.map((data) => {
      const weekName = `Week-${data.week + 1}-${data.sub ? data.sub : ""}`;
      tableData[
        weekName
      ] = `${data.sets}x${data.reps[0]}, ${data.weight[0]}${data.weightType}`;
    });
    return tableData;
  };

  const allDayData = getAllDayData();
  const allExerciseData = allDayData.map((data) => getExerciseData(data));
  const allTableData = allExerciseData.map((data) =>
    data.map((td) => getTableData(td))
  );

  const allColumns = useMemo(
    () =>
      allTableData.map((data) =>
        data.length
          ? Object.keys(data[0]).map((columnId) => ({
              header: columnId,
              accessorKey: columnId,
              id: columnId,
            }))
          : []
      ),
    [JSON.stringify(allTableData)]
  );

  const tables = Array.from(Array(7).keys()).map((idx) =>
    useMaterialReactTable({
      columns: allColumns[idx] || [],
      data: allTableData[idx] || [],
    })
  );

  return (
    <div className={`${classes.container}`}>
      {tables.map((table, idx) => (
        <div key={idx}>
          {table.getRowCount() > 0 && <MaterialReactTable table={table} />}
        </div>
      ))}
    </div>
  );
};
