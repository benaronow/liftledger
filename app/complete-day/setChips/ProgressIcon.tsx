import { COLORS } from "@/lib/colors";
import { useMemo } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaGripLines } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { PiEmptyBold } from "react-icons/pi";

interface Props {
  sign?: number;
  isSetComplete: boolean;
}

export const ProgressIcon = ({ sign, isSetComplete }: Props) => {
  const background = useMemo(() => {
    if (!isSetComplete) return COLORS.container;
    if (sign === undefined) return COLORS.background;
    if (sign === 0) return COLORS.warning;
    return sign > 0 ? COLORS.success : COLORS.danger;
  }, [sign]);

  return (
    <div className="position-relative">
      <div
        className="position-absolute top-50 start-50 translate-middle"
        style={{
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          background,
        }}
      />
      {isSetComplete ? (
        <>
          {sign === undefined && (
            <PiEmptyBold
              className="position-absolute top-50 start-50 translate-middle"
              style={{ fontSize: "18px" }}
            />
          )}
          {sign === 0 && (
            <FaGripLines
              className="position-absolute top-50 start-50 translate-middle"
              style={{ fontSize: "18px" }}
            />
          )}
          {sign && sign > 0 && (
            <IoIosArrowUp
              className="position-absolute top-50 start-50"
              style={{
                fontSize: "24px",
                transform: "translate(-50%, calc(-50% - 1px))",
              }}
            />
          )}
          {sign && sign < 0 && (
            <IoIosArrowDown
              className="position-absolute top-50 start-50"
              style={{
                fontSize: "24px",
                transform: "translate(-50%, calc(-50% + 1px))",
              }}
            />
          )}
        </>
      ) : (
        <BiDotsHorizontalRounded
          className="position-absolute top-50 start-50 translate-middle"
          style={{ fontSize: "24px" }}
        />
      )}
    </div>
  );
};
