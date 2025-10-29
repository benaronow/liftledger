import { COLORS } from "@/lib/colors";
import { ReactNode } from "react";

export interface FooterAction {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ButtonProps {
  action: FooterAction;
}

const Button = ({ action }: ButtonProps) => {
  return (
    <button
      className="border border-0 rounded d-flex align-items-center justify-content-center gap-2 py-1 px-2"
      style={{
        height: "35px",
        color: action.disabled ? "#a7a7a7" : "white",
        background: action.disabled ? "#317baf" : "#0096FF",
      }}
      onClick={action.onClick}
      disabled={action.disabled}
    >
      {action.icon}
      <span>{action.label}</span>
    </button>
  );
};

interface Props {
  actions: FooterAction[];
}

export const ActionsFooter = ({ actions }: Props) => {
  return (
    <div
      className="position-absolute w-100 d-flex align-items-center justify-content-end gap-3"
      style={{
        bottom: "75px",
        height: "75px",
        minHeight: "75px",
        zIndex: 2,
        paddingRight: "15px",
      }}
    >
      <div
        className="d-flex align-items-center gap-2 p-2 rounded"
        style={{
          height: "55px",
          background: COLORS.container,
          boxShadow: "0px 0px 15px #131314",
        }}
      >
        {actions.map((action) => (
          <Button key={action.label} action={action} />
        ))}
      </div>
    </div>
  );
};
