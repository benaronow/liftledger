import React, { useContext } from "react";
import { makeStyles } from "tss-react/mui";
import { LoginContext } from "@/app/providers/loginProvider";
import { TableData, TableDay, TableExercise, Week } from "@/types";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: "10px 10px 10px 10px",
    height: "calc(100dvh - 120px)",
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100dvh - 50px)",
    },
  },
  dayLabel: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    background: "black",
    minHeight: "30px",
    alignItems: "center",
    border: "solid",
    borderWidth: "1px",
    borderColor: "black",
    color: "white",
  },
  bottom: {
    borderRadius: "0px 0px 25px 25px",
  },
  cell: {
    border: "solid",
    borderWidth: "1px",
    left: 0,
    minWidth: 100,
    maxWidth: 100,
    width: 100,
  },
  stickyCell: {
    position: "sticky",
    zIndex: 2,
  },
}));

const paperStyle = { width: "100%" };

export const Progress = () => {
  const { classes } = useStyles();
  const { curUser } = useContext(LoginContext);

  const laterSessions = (curWeek: Week, curDay: number) => {
    const curDayDetail = curWeek.days[curDay];
    const idcs = [];
    for (let i = curDay + 1; i < curWeek.days.length; i++) {
      const laterSessionDetail = curWeek.days[i];
      if (
        curDayDetail.hasGroup &&
        laterSessionDetail.hasGroup &&
        curDayDetail.groupName === laterSessionDetail.groupName
      )
        idcs.push(i);
    }
    return idcs;
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
          const dayData: TableDay[] = [];
          const laterSessionIdcs = laterSessions(exWeek, idx);
          const prevSessionIdx = prevSession(exWeek, idx);
          if (prevSessionIdx !== undefined || !curUser?.curBlock)
            return dayData;
          for (let i = 0; i < curUser.curBlock.weeks.length; i++) {
            const week = curUser.curBlock.weeks[i];
            if (laterSessionIdcs.length) {
              dayData.push({ ...week.days[idx], week: i, sub: 1 });
              for (let j = 0; j < laterSessionIdcs.length; j++) {
                dayData.push({
                  ...week.days[laterSessionIdcs[j]],
                  week: i,
                  sub: j + 2,
                });
              }
            } else {
              dayData.push({ ...week.days[idx], week: i });
            }
          }
          return dayData;
        })
        .filter((dayData) => dayData.length > 0) || []
    );
  };

  const getExerciseData = (dayData: TableDay[]) => {
    if (!dayData.length) return [];
    const exDay = dayData[0];
    return exDay?.exercises.map((exercise) => {
      const exerciseData: TableExercise[] = [];
      let maxWeight = 0;
      let maxSub = 0;
      for (const day of dayData) {
        const exerciseMatch = day.exercises.find(
          (ddExercise) => ddExercise.name === exercise.name
        );
        if (exerciseMatch) {
          exerciseData.push({
            ...exerciseMatch,
            week: day.week,
            sub: day.sub,
            up: maxWeight !== 0 && exerciseMatch.weight[0] > maxWeight,
            down: maxWeight !== 0 && exerciseMatch.weight[0] < maxWeight,
          });
          maxWeight = Math.max(maxWeight, exerciseMatch.weight[0]);
          maxSub = Math.max(maxSub, day.sub || 0);
        }
      }
      return { exerciseData, day: exDay.groupName || exDay.name, subs: maxSub };
    });
  };

  const getTableData = (exerciseData: TableExercise[]) => {
    if (!exerciseData.length) return undefined;
    const tableData: TableData = {
      Exercise: `${exerciseData[0].name} (${exerciseData[0].apparatus})`,
    };
    exerciseData.map((data) => {
      tableData[`Week ${data.week + 1}${data.sub ? `-${data.sub}` : ""}`] = [
        `${data.sets}`,
        `${data.reps[0]}`,
        `${data.weight[0]}`,
        `${data.weightType}`,
        `${data.up ? "Up" : data.down ? "Down" : "None"}`,
        `${data.completed}`,
      ];
    });
    return tableData;
  };

  const getHeaderColor = (
    key: string,
    firstTableData: {
      data: TableData | undefined;
      day: string;
      subs: number;
      colspan: number;
    }
  ) => {
    if (!key.split(" ")[1]) return "#a3258c";
    const num =
      parseInt(key.split(" ")[1].split("-")[0]) * (firstTableData.subs || 1) -
      (firstTableData.subs - (parseInt(key.split(" ")[1].split("-")[1]) || 0));
    const denom = Object.keys(firstTableData.data || {}).length - 1;
    return `color-mix(in srgb, #a3258c, #0096FF ${(num / denom) * 100}%`;
  };

  const getCellColor = (key: string | string[]) => {
    return key.includes("true")
      ? key.includes("Down")
        ? "red"
        : key.includes("Up")
        ? "#32CD32"
        : key.includes("None")
        ? "lightgray"
        : "white"
      : key.includes("false")
      ? "white"
      : "gray";
  };

  const allDayData = getAllDayData();
  const allExerciseData = allDayData.map((data) => getExerciseData(data));
  const maxSubs = allExerciseData.reduce((acc: number, cur) => {
    return Math.max(acc, cur[0].subs);
  }, 0);
  const allTableData = allExerciseData.map((data) =>
    data.map((td) => {
      return {
        data: getTableData(td.exerciseData),
        day: td.day,
        subs: td.subs,
        colspan: (maxSubs / (td.subs || 1)) * 7,
      };
    })
  );
  console.log(allTableData[0]);

  return (
    <div className={`${classes.container}`}>
      <>
        {allTableData.map((tableData, idx) => (
          <React.Fragment key={idx}>
            <div
              className={classes.dayLabel}
              style={{
                borderRadius: `${idx === 0 ? "25px 25px 0px 0px" : ""}`,
              }}
            >
              <span>{tableData[0].day}</span>
            </div>
            <Paper sx={paperStyle}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {Object.keys(tableData[0]?.data || {}).map((key, idx) => (
                        <TableCell
                          className={`${classes.cell} ${
                            idx === 0 && classes.stickyCell
                          }`}
                          key={idx}
                          align={idx === 0 ? "left" : "center"}
                          colSpan={idx === 0 ? 1 : tableData[0]?.colspan}
                          style={{
                            background: getHeaderColor(key, tableData[0]),
                          }}
                        >
                          {key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((data, idx) => (
                      <TableRow key={idx}>
                        {Object.values(data?.data || {}).map((key, idx) => (
                          <TableCell
                            className={`${classes.cell} ${
                              idx === 0 && classes.stickyCell
                            }`}
                            key={idx}
                            align={idx === 0 ? "left" : "center"}
                            colSpan={idx === 0 ? 1 : data.colspan}
                            style={{
                              background: `${getCellColor(key)}`,
                            }}
                          >
                            {key.includes("true")
                              ? `${key[0]}x${key[1]}, ${key[2]}${key[3]}`
                              : key.includes("false")
                              ? ""
                              : key}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </React.Fragment>
        ))}
        <div className={`${classes.dayLabel} ${classes.bottom}`} />
      </>
    </div>
  );
};
