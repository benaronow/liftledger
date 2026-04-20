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
      className="d-flex flex-column position-absolute w-100"
      style={{
        bottom: 0,
        zIndex: 2,
        background: COLORS.primary,
        borderRadius: "20px 20px 0 0",
        overflow: "hidden",
        boxShadow: "0px -4px 15px rgba(0,0,0,0.5)",
      }}
    >
      <div className="w-100">
        <div
          style={{
            maxHeight: expanded ? "75px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.2s ease",
            background: COLORS.container,
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
        <div className="d-flex align-items-center">
          {actions.length > 1 && (
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
          )}
          <ActionButton
            icon={primaryAction.icon}
            label={primaryAction.label}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            variant={primaryAction.variant}
            height={50}
            roundedSide="0"
          />
          {actions.length > 1 && (
            <div
              style={{
                height: 50,
                width: 50,
                minWidth: 50,
                background: primaryAction.disabled
                  ? COLORS.primaryDisabled
                  : COLORS.primary,
              }}
            />
          )}
        </div>
      </div>
      <div className="d-flex w-100" style={{ height: 75 }}>
        {actions.length > 1 && (
          <div
            className="h-100"
            style={{ minWidth: 50, background: COLORS.primary }}
          />
        )}
        <div
          className="h-100 w-100"
          style={{
            background: primaryAction.disabled
              ? COLORS.primaryDisabled
              : COLORS.primary,
          }}
        />
      </div>
    </div>
  );
};
