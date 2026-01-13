"use client";

import { useTheme } from "@mui/material";
import dayjs from "dayjs";
import { ControlPointDuplicate } from "@mui/icons-material";
import { Block, RouteType, Set } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScreenState } from "@/app/providers/ScreenStateProvider";
import { Spinner } from "../components/spinner";
import { useUser } from "@/app/providers/UserProvider";
import { checkIsBlockDone } from "@/lib/blockUtils";
import { useBlock } from "@/app/providers/BlockProvider";

const getTemplateFromBlock = (block: Block) => ({
  name: block.name,
  startDate: new Date(),
  length: block.length,
  primaryGym: block.primaryGym,
  weeks: [
    block.weeks[block.length - 1].map((day) => {
      return {
        name: day.name,
        gym: day.gym,
        exercises: day.exercises
          .filter((ex) => !ex.addedOn)
          .map((exercise) => {
            return {
              name: exercise.name,
              apparatus: exercise.apparatus,
              gym: exercise.gym,
              sets: exercise.sets.map((set: Set) => ({
                ...set,
                completed: false,
                skipped: false,
                note: "",
              })),
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

export const History = () => {
  const router = useRouter();
  const { curUser, session } = useUser();
  const { setTemplateBlock, setEditingWeekIdx } = useBlock();
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
    return block.weeks[block.length - 1][
      block.weeks[block.length - 1].length - 1
    ].completedDate;
  };

  const handleCreateFromTemplate = (block: Block) => {
    setTemplateBlock(getTemplateFromBlock(block));
    setEditingWeekIdx(0);
    router.push("/create-block");
  };

  console.log(curUser?.blocks);

  const completedBlocks = curUser?.blocks
    .filter((block) => checkIsBlockDone(block))
    .map((block, idx) => {
      return (
        <div
          key={idx}
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
          <div
            className="d-flex w-100 align-items-center"
            style={{
              background: "#131314",
              padding: "5px 10px",
              borderRadius: "5px",
              height: "35px",
              fontSize: "14px",
              overflow: "hidden",
            }}
          >
            <span className="text-nowrap text-truncate">
              <span className="fw-bold" style={{ marginRight: "5px" }}>{`${
                idx + 1
              }. ${block.name}`}</span>
              <span>{`(${dayjs(block.startDate).format("M/DD/YY")} -  ${
                getCompletedDate(block)
                  ? dayjs(getCompletedDate(block)).format("M/DD/YY")
                  : "N/A"
              })`}</span>
            </span>
          </div>
          <button
            className="d-flex justify-content-center align-items-center border-0"
            style={{
              marginLeft: "5px",
              background: "#0096FF",
              color: "white",
              height: "35px",
              width: "35px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => handleCreateFromTemplate(block)}
          >
            <ControlPointDuplicate />
          </button>
        </div>
      );
    });

  if (!curUser || isFetching) return <Spinner />;

  return (
    <div
      className="d-flex flex-column align-items-center w-100"
      style={{
        height: "100dvh",
        padding: "65px 15px 85px",
        overflow: "scroll",
      }}
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
