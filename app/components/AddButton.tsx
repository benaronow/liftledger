import { COLORS } from "@/lib/constants";
import { GrFormAdd } from "react-icons/gr";

interface Props {
  onClick: () => void;
}

export const AddButton = ({ onClick }: Props) => {
  return (
    <div
      className="d-flex justify-content-between align-items-center"
      style={{ width: "90%", marginBottom: "15px" }}
    >
      <div style={{ width: "100%", height: "2px", background: "#0096FF" }} />
      <button
        className="d-flex justify-content-center align-items-center border-0 text-white p-0"
        style={{
          background: COLORS.primary,
          fontSize: "20px",
          height: "20px",
          minWidth: "20px",
          borderRadius: "20px",
          margin: "0 10px",
          cursor: "pointer",
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
