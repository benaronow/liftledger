import { ReactNode } from "react";
import { Modal } from "react-bootstrap";
import { COLORS } from "@/lib/colors";
import { ActionButton, Variant } from "./ActionButton";

export interface DialogAction {
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: Variant;
}

interface Props {
  readonly children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  actions: DialogAction[];
}

export const ActionDialog = ({
  children,
  open,
  onClose,
  title,
  actions,
}: Props) => {
  return (
    <Modal
      show={open}
      onHide={onClose}
      centered
      style={{
        marginLeft: "15%",
        maxWidth: "70%",
      }}
    >
      <Modal.Header
        className="d-flex justify-content-center align-items-center p-2 border-0"
        style={{
          background: COLORS.dark,
        }}
      >
        <Modal.Title className="text-white">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className={`d-flex flex-column align-items-center p-2 border-0 ${
          actions.length === 0 ? "rounded-bottom" : ""
        }`}
        style={{ background: COLORS.container }}
      >
        {children}
      </Modal.Body>
      {actions.length !== 0 && (
        <Modal.Footer
          className="d-flex justify-content-between align-items-center border-0 flex-nowrap p-2 gap-2"
          style={{ background: COLORS.dark }}
        >
          {actions.map((action, idx) => (
            <ActionButton
              key={idx}
              icon={action.icon}
              onClick={action.onClick}
              disabled={action.disabled}
              variant={action.variant}
              height={55}
            />
          ))}
        </Modal.Footer>
      )}
    </Modal>
  );
};
