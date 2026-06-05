import { DARK_COLORS } from "@liftledger/shared";
import { PropsWithChildren } from "react";
import { ActionButton, Variant } from "@/components/ActionButton";
import { GoAlertFill } from "react-icons/go";
import { useTheme } from "@/providers/ThemeProvider";

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
  disabledMessage?: string;
}

export const Info = ({
  title,
  actions,
  disabledMessage,
  children,
}: PropsWithChildren<Props>) => {
  const { colors } = useTheme();
  return (
    <div
      className="w-100 rounded position-relative overflow-hidden"
      style={{
        marginBottom: "15px",
      }}
    >
      {disabledMessage && (
        <div
          className="d-flex gap-3 justify-content-center align-items-center position-absolute w-100 p-4"
          style={{ inset: 0, zIndex: 2, background: "rgba(0,0,0,0.8)" }}
        >
          <div
            className="d-flex justify-content-center align-items-center bg-white"
            style={{
              height: "40px",
              width: "40px",
              minWidth: "40px",
              borderRadius: "50%",
            }}
          >
            <GoAlertFill
              style={{
                color: DARK_COLORS.danger,
                fontSize: "30px",
                transform: "translateY(-2px)",
              }}
            />
          </div>
          <strong className="text-white text-start">{disabledMessage}</strong>
        </div>
      )}
      <div className="d-flex flex-column w-100 position-relative">
        <div
          className="w-100 d-flex align-items-center justify-content-center p-1"
          style={{ background: colors.dark }}
        >
          <strong className="text-white fs-6">{title}</strong>
        </div>
        <div
          className="d-flex flex-column w-100 gap-2 p-2"
          style={{ background: colors.container }}
        >
          {children}
        </div>
        <div
          className="d-flex w-100 align-items-center gap-2 p-2"
          style={{ background: colors.dark }}
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
    </div>
  );
};
