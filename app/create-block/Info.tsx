import { COLORS } from "@/lib/colors";
import { PropsWithChildren } from "react";
import { ActionButton, Variant } from "../components/ActionButton";

export interface InfoAction {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: Variant;
  className?: string;
}

interface Props {
  title: string;
  actions?: InfoAction[];
}

export const Info = ({
  title,
  actions,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div
      className="d-flex flex-column w-100 rounded overflow-hidden"
      style={{
        marginBottom: "15px",
        boxShadow: "0px 5px 10px #131314",
      }}
    >
      <div
        className="w-100 d-flex align-items-center justify-content-center p-1"
        style={{ background: COLORS.dark }}
      >
        <strong className="text-white fs-6">{title}</strong>
      </div>
      <div
        className="d-flex flex-column w-100 gap-2 p-2"
        style={{ background: COLORS.container }}
      >
        {children}
      </div>
      <div
        className="d-flex w-100 align-items-center gap-2 p-2"
        style={{ background: COLORS.dark }}
      >
        {actions?.map((action, idx) => (
          <ActionButton
            key={idx}
            icon={action.icon}
            onClick={action.onClick}
            disabled={action.disabled}
            variant={action.variant}
            className={action.className}
          />
        ))}
      </div>
    </div>
  );
};
