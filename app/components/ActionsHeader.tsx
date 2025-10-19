import { ReactNode } from "react";

export interface HeaderAction {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  side: "left" | "right" | "";
  disabled?: boolean;
}

interface ButtonProps {
  action: HeaderAction;
}

const Button = ({ action }: ButtonProps) => {
  return (
    <button
      className="border border-0 rounded d-flex align-items-center justify-content-center gap-2 py-1 px-2"
      style={{
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
  actions: HeaderAction[];
}

export const ActionsHeader = ({ actions }: Props) => {
  const leftAction = actions.find((action) => action.side === "left");
  const rightAction = actions.find((action) => action.side === "right");

  return (
    <div
      className="position-absolute w-100 d-flex align-items-center justify-content-between top-0"
      style={{
        height: "100px",
        minHeight: "100px",
        padding: "50px 15px 0",
        background:
          "linear-gradient(180deg, #131314 0%, #131314 60%, transparent 100%)",
        zIndex: 2,
      }}
    >
      {leftAction ? <Button action={leftAction} /> : <div />}
      {rightAction ? <Button action={rightAction} /> : <div />}
    </div>
  );
};
