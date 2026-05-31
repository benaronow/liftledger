import { COLORS } from "@/lib/colors";

export const NoDataPlaceholder = () => {
  return (
    <div className="d-flex flex-column flex-grow-1 gap-2 justify-content-center align-items-center">
      <svg
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS.textDisabled}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.5 }}
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
      <span style={{ fontSize: 18, color: COLORS.textDisabled }}>
        No data for this exercise
      </span>
    </div>
  );
};
