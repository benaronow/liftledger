import { FocusEvent, JSX, PropsWithChildren } from "react";

interface Props {
  className?: string;
  label?: string;
  error?: string;
  renderEnd?: () => JSX.Element;
  onFocus?: (e: FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e: FocusEvent<HTMLDivElement>) => void;
}

export const LabeledInputContainer = ({
  className,
  label,
  error,
  renderEnd,
  children,
  onFocus,
  onBlur,
}: PropsWithChildren<Props>) => {
  return (
    <div
      className={`d-flex flex-column align-items-start w-100 gap-1 ${className ?? ""}`}
    >
      {label && (
        <span
          className="fw-semibold text-nowrap text-white"
          style={{ fontSize: "14px" }}
        >
          {label}
        </span>
      )}
      <div className="d-flex w-100" onFocus={onFocus} onBlur={onBlur}>
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
