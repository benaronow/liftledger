import { JSX, PropsWithChildren } from "react";

interface Props {
  className?: string;
  label?: string;
  error?: string;
  renderEnd?: () => JSX.Element;
  onBlur?: () => void;
}

export const LabeledInputContainer = ({
  className,
  label,
  error,
  renderEnd,
  children,
  onBlur,
}: PropsWithChildren<Props>) => {
  return (
    <div
      className={`d-flex flex-column align-items-start w-100 gap-1 ${className}`}
    >
      {label && (
        <span
          className="fw-semibold text-nowrap text-white"
          style={{ fontSize: "14px" }}
        >
          {label}
        </span>
      )}
      <div className="d-flex w-100" onBlur={onBlur}>
        {children}
        {renderEnd && renderEnd()}
      </div>
      {error && (
        <span className="text-danger" style={{ fontSize: "12px" }}>
          {error}
        </span>
      )}
    </div>
  );
};
