"use client";

import { COLORS } from "@/lib/colors";
import { ReactNode, useState } from "react";
import { ActionButton, Variant } from "./ActionButton";
import { IoClose, IoMenu } from "react-icons/io5";

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
  const [expanded, setExpanded] = useState(false);

  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1);

  return (
    <div
      className="position-absolute w-100"
      style={{
        bottom: 0,
        zIndex: 2,
        background: COLORS.container,
        borderRadius: "20px 20px 0 0",
        overflow: "hidden",
        boxShadow: "0px -4px 15px rgba(0,0,0,0.5)",
        paddingBottom: "75px",
      }}
    >
      <div
        style={{
          maxHeight: expanded ? "80px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.2s ease",
        }}
      >
        <div className="d-flex align-items-center justify-content-around px-3 py-2 gap-2">
          {secondaryActions.map((action, idx) => (
            <ActionButton
              key={idx}
              icon={action.icon}
              label={action.label}
              onClick={() => {
                action.onClick();
                setExpanded(false);
              }}
              disabled={action.disabled}
              variant={action.variant}
              height={50}
            />
          ))}
        </div>
      </div>
      {expanded && (
        <div
          style={{
            height: "2px",
            background: COLORS.background,
            margin: "0 12px",
          }}
        />
      )}
      <div className="d-flex align-items-center justify-content-between px-3 py-2 gap-2">
        {actions.length > 1 ? (
          <ActionButton
            icon={
              expanded ? (
                <IoClose style={{ fontSize: "20px" }} />
              ) : (
                <IoMenu style={{ fontSize: "20px" }} />
              )
            }
            onClick={() => setExpanded((prev) => !prev)}
            variant="primary"
            height={50}
            width={50}
          />
        ) : (
          <div />
        )}
        <ActionButton
          icon={primaryAction.icon}
          label={primaryAction.label}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          variant={primaryAction.variant}
          height={50}
          width="auto"
        />
      </div>
    </div>
  );
};
