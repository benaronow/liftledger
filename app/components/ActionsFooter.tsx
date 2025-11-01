import { COLORS } from "@/lib/colors";
import { ReactNode } from "react";
import { ActionButton, Variant } from "./ActionButton";

export interface FooterAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: Variant;
}

interface Props {
  actions: FooterAction[];
}

export const ActionsFooter = ({ actions }: Props) => {
  return (
    <div
      className="position-absolute w-100 d-flex align-items-center justify-content-end py-2"
      style={{
        bottom: "75px",
        zIndex: 2,
        paddingRight: "15px",
      }}
    >
      <div
        className="d-flex align-items-center gap-2 p-2 rounded"
        style={{
          background: COLORS.container,
          boxShadow: "0px 0px 15px #131314",
        }}
      >
        {actions.map((action, idx) => (
          <ActionButton
            key={idx}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            variant={action.variant}
          />
        ))}
      </div>
    </div>
  );
};
