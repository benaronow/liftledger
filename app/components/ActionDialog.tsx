import { ReactNode } from "react";
import { Modal } from "react-bootstrap";
import { COLORS } from "@/lib/colors";

export interface Action {
  text: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

interface Props {
  readonly children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  actions: Action[];
}

export type ChangeExerciseType = "name" | "apparatus" | "weightType";
export type SubmitExerciseType = "change" | "add" | "delete";

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
        className="d-flex flex-column align-items-center p-2 border-0"
        style={{ background: COLORS.container }}
      >
        {children}
      </Modal.Body>
      <Modal.Footer
        className="d-flex justify-content-between align-items-center border-0 flex-nowrap p-2 gap-2"
        style={{ background: COLORS.dark }}
      >
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="d-flex justify-content-center align-items-center w-100 border-0 rounded m-0"
            style={{
              background: action.disabled
                ? COLORS.primaryDisabled
                : COLORS.primary,
              color: action.disabled ? COLORS.textDisabled : "white",
              fontSize: "28px",
              height: "50px",
            }}
            disabled={action.disabled}
            onClick={action.disabled ? undefined : action.onClick}
          >
            {action.text}
          </button>
        ))}
      </Modal.Footer>
    </Modal>
  );
};
