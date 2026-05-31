"use client";

import dayjs from "dayjs";
import { MdControlPointDuplicate } from "react-icons/md";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { Block } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogoSpinner } from "@/app/components/LogoSpinner";
import { useUser } from "@/app/layoutContainer/UserProvider";
import { useBlock } from "@/app/layoutContainer/BlockProvider";
import { useCompletedExercises } from "@/app/layoutContainer/CompletedExercisesProvider";
import { ActionButton } from "../components/ActionButton";

export const History = () => {
  const router = useRouter();
  const { curUser } = useUser();
  const { curBlock, setTemplateBlock, setEditingWeekIdx } = useBlock();
  const { getNewSetsFromLatest } = useCompletedExercises();
  const isTabletOrLarger = useMediaQuery("(min-width: 600px)");

  useEffect(() => {
    if (isTabletOrLarger) router.push("/dashboard");
  }, [isTabletOrLarger]);

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
            icon={<MdControlPointDuplicate size={28} />}
            onClick={() => handleCreateFromTemplate(block)}
          />
        </div>
      );
    });

  if (!curUser) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column align-items-center w-100 h-100 overflow-y-scroll"
      style={{ padding: "15px 0px" }}
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
