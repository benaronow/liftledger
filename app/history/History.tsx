"use client";

import { useTheme } from "@mui/material";
import dayjs from "dayjs";
import { ControlPointDuplicate } from "@mui/icons-material";
import { Block, RouteType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScreenState } from "@/app/layoutContainer/ScreenStateProvider";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { useBlock } from "@/app/layoutContainer/BlockProvider";
import { useCompletedExercises } from "@/app/layoutContainer/CompletedExercisesProvider";
import { ActionButton } from "../components/ActionButton";

export const History = () => {
  const router = useRouter();
  const { curUser, session } = useUser();
  const { curBlock, setTemplateBlock, setEditingWeekIdx } = useBlock();
  const { getNewSetsFromLatest } = useCompletedExercises();
  const { innerWidth, isFetching, toggleScreenState } = useScreenState();
  const theme = useTheme();

  useEffect(() => {
    if (!session) {
      router.push("/dashboard");
    } else {
      toggleScreenState("fetching", false);
      router.prefetch(RouteType.Add);
      router.prefetch(RouteType.Home);
      router.prefetch(RouteType.Profile);
      router.prefetch(RouteType.Progress);
    }
  }, []);

  useEffect(() => {
    if (innerWidth && innerWidth > theme.breakpoints.values["sm"])
      router.push("/dashboard");
  }, [innerWidth]);

  const getCompletedDate = (block: Block) => {
    if (block.endDate) return block.endDate;

    const finalWeek = block.weeks[block.weeks.length - 1];
    const finalDay = finalWeek[finalWeek.length - 1];

    return finalDay.completedDate;
  };

  const getTemplateFromBlock = (block: Block) => ({
    name: block.name,
    startDate: new Date(),
    length: block.length,
    primaryGym: block.primaryGym,
    weeks: [
      block.weeks[block.length - 1].map((day) => {
        return {
          name: day.name,
          gym: block.primaryGym,
          exercises: day.exercises
            .filter((ex) => !ex.addedOn)
            .map((exercise) => {
              return {
                name: exercise.name,
                apparatus: exercise.apparatus,
                gym: block.primaryGym,
                sets: getNewSetsFromLatest({
                  ...exercise,
                  gym: block.primaryGym,
                }),
                weightType: exercise.weightType,
              };
            }),
          completedDate: undefined,
        };
      }),
    ],
    curDayIdx: 0,
    curWeekIdx: 0,
  });

  const handleCreateFromTemplate = (block: Block) => {
    setTemplateBlock(getTemplateFromBlock(block));
    setEditingWeekIdx(0);
    router.push("/edit-block");
  };

  const completedBlocks = curUser?.blocks
    .filter((block) => block._id !== curBlock?._id)
    .map((block, idx) => {
      return (
        <div
          key={idx}
          className="d-flex align-items-center w-100 text-white text-nowrap justify-content-between rounded"
          style={{
            fontFamily: "League+Spartan",
            fontSize: "14px",
            marginBottom: "15px",
            background: "#131314",
            borderRadius: "5px",
            boxShadow: "0px 5px 10px #131314",
            height: "35px",
            paddingLeft: "10px",
          }}
        >
          <span className="overflow-hidden text-nowrap text-truncate">
            <span className="fw-bold" style={{ marginRight: "5px" }}>{`${
              idx + 1
            }. ${block.name}`}</span>
            <span>{`(${dayjs(block.startDate).format("M/DD/YY")} -  ${
              getCompletedDate(block)
                ? dayjs(getCompletedDate(block)).format("M/DD/YY")
                : "N/A"
            })`}</span>
          </span>
          <ActionButton
            roundedSide="end"
            height={35}
            width={35}
            icon={<ControlPointDuplicate />}
            onClick={() => handleCreateFromTemplate(block)}
          />
        </div>
      );
    });

  if (!curUser || isFetching) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column align-items-center w-100"
      style={{ height: "100%", overflow: "scroll" }}
    >
      {completedBlocks && completedBlocks[0] ? (
        completedBlocks
      ) : (
        <div
          className="d-flex align-items-center w-100 text-white text-nowrap justify-content-between"
          style={{
            fontFamily: "League+Spartan",
            fontSize: "14px",
            marginBottom: "15px",
            background: "#58585b",
            borderRadius: "5px",
            border: "solid 5px #58585b",
            boxShadow: "0px 5px 10px #131314",
          }}
        >
          <span
            className="fw-bold"
            style={{
              fontFamily: "League+Spartan",
              fontSize: "16px",
              textAlign: "center",
              marginRight: "5px",
            }}
          >
            No completed blocks yet
          </span>
        </div>
      )}
    </div>
  );
};
