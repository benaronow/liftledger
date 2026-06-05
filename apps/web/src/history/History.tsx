import dayjs from "dayjs";
import { MdControlPointDuplicate } from "react-icons/md";
import { useMediaQuery } from "@/useMediaQuery";
import { Block } from "@liftledger/shared";
import { useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { LogoSpinner } from "@/components/LogoSpinner";
import { useMe, useBlock } from "@liftledger/api-client";
import { ActionButton } from "../components/ActionButton";
import { useTheme } from "../providers/ThemeProvider";

export const History = () => {
  const navigate = useNavigate();
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: curBlock, isLoading: isBlockLoading } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const isTabletOrLarger = useMediaQuery("(min-width: 600px)");
  const { colors } = useTheme();

  useEffect(() => {
    if (isTabletOrLarger) navigate("/dashboard");
  }, [isTabletOrLarger, navigate]);

  const getCompletedDate = (block: Block) => {
    if (block.endDate) return block.endDate;

    const finalWeek = block.weeks[block.weeks.length - 1];
    const finalDay = finalWeek[finalWeek.length - 1];

    return finalDay.completedDate;
  };

  const completedBlocks = useMemo(
    () =>
      curUser?.blocks
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
                background: colors.dark,
                borderRadius: "5px",
                boxShadow: `0px 5px 5px ${colors.dark}`,
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
                onClick={() =>
                  navigate(`/edit-block?duplicateFrom=${block._id}`)
                }
              />
            </div>
          );
        }),
    [curUser, curBlock, navigate],
  );

  if (isUserLoading || isBlockLoading) return <LogoSpinner />;

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
            background: colors.container,
            borderRadius: "5px",
            border: `solid 5px ${colors.container}`,
            boxShadow: `0px 5px 10px ${colors.dark}`,
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
