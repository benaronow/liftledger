import { ReactNode } from "react";

export interface FooterAction {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  side: "left" | "right" | "";
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
        boxShadow: `0px 0px 20px rgba(0, 0, 0, 0.75)`,
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
  const leftAction = actions.find((action) => action.side === "left");
  const rightAction = actions.find((action) => action.side === "right");

  return (
    <div
      className="position-absolute w-100 d-flex align-items-center justify-content-end gap-3"
      style={{
        paddingRight: "15px",
        bottom: "75px",
        height: "55px",
        minHeight: "55px",
        zIndex: 2,
      }}
    >
      {leftAction ? <Button action={leftAction} /> : <div />}
      {rightAction ? <Button action={rightAction} /> : <div />}
    </div>
  );
};
