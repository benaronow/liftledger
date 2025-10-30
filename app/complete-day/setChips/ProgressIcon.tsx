import { COLORS } from "@/lib/colors";
import { useMemo } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaGripLines } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp, IoIosSkipForward } from "react-icons/io";
import { PiEmptyBold } from "react-icons/pi";

interface Props {
  sign?: number;
  isSetComplete: boolean;
  isSetSkipped?: boolean;
}

export const ProgressIcon = ({ sign, isSetComplete, isSetSkipped }: Props) => {
  const background = useMemo(() => {
    if (!isSetComplete && !isSetSkipped) return COLORS.container;
    if (sign === undefined || isSetSkipped) return COLORS.background;
    if (sign === 0) return COLORS.warning;
    return sign > 0 ? COLORS.success : COLORS.danger;
  }, [sign, isSetComplete, isSetSkipped]);

  const Icon = useMemo(() => {
    if (isSetSkipped)
      return (
        <IoIosSkipForward
          className="position-absolute top-50 start-50 translate-middle"
          style={{ fontSize: "18px" }}
        />
      );
    if (!isSetComplete)
      return (
        <BiDotsHorizontalRounded
          className="position-absolute top-50 start-50 translate-middle"
          style={{ fontSize: "24px" }}
        />
      );
    if (sign && sign > 0)
      return (
        <IoIosArrowUp
          className="position-absolute top-50 start-50"
          style={{
            fontSize: "24px",
            transform: "translate(-50%, calc(-50% - 1px))",
          }}
        />
      );
    if (sign && sign < 0)
      return (
        <IoIosArrowDown
          className="position-absolute top-50 start-50"
          style={{
            fontSize: "24px",
            transform: "translate(-50%, calc(-50% + 1px))",
          }}
        />
      );
    return sign !== undefined ? (
      <FaGripLines
        className="position-absolute top-50 start-50 translate-middle"
        style={{ fontSize: "18px" }}
      />
    ) : (
      <PiEmptyBold
        className="position-absolute top-50 start-50 translate-middle"
        style={{ fontSize: "18px" }}
      />
    );
  }, [sign, isSetComplete, isSetSkipped]);

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
      {Icon}
    </div>
  );
};
