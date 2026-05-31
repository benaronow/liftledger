import { COLORS } from "@/lib/colors";
import { GrFormAdd } from "react-icons/gr";

interface Props {
  onClick: () => void;
}

export const AddButton = ({ onClick }: Props) => {
  return (
    <div
      className="d-flex justify-content-between align-items-center mb-2"
      style={{ width: "90%" }}
    >
      <div
        className="w-100"
        style={{ height: "2px", background: COLORS.primary }}
      />
      <button
        className="d-flex justify-content-center align-items-center border-0 text-white p-0 mx-2"
        style={{
          background: COLORS.primary,
          fontSize: "20px",
          height: "20px",
          minWidth: "20px",
          borderRadius: "20px",
        }}
        onClick={onClick}
      >
        <GrFormAdd />
      </button>
      <div
        className="w-100"
        style={{ height: "2px", background: COLORS.primary }}
      />
    </div>
  );
};
