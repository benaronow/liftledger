import { MdArrowBackIosNew } from "react-icons/md";
import { FaSave, FaStopCircle } from "react-icons/fa";
import { ActionsFooter, FooterAction } from "../components/ActionsFooter";
import { useEditBlock } from "./EditBlockProvider";
import { useBlock } from "../layoutContainer/BlockProvider";

export const EditBlockFooter = () => {
  const { curBlock } = useBlock();
  const {
    editingDayIdx,
    setEditingDayIdx,
    setSaveDialogOpen,
    setQuitDialogOpen,
    templateErrors,
  } = useEditBlock();

  const footerActions: FooterAction[] =
    editingDayIdx !== -1
      ? [
          {
            icon: <MdArrowBackIosNew style={{ fontSize: "20px" }} />,
            label: "Return to week",
            onClick: () => setEditingDayIdx(-1),
            variant: "primary",
          },
        ]
      : [
          {
            icon: <FaSave style={{ fontSize: "18px" }} />,
            label: "Save",
            onClick: () => setSaveDialogOpen(true),
            disabled: templateErrors.length > 0,
            variant: "primary",
          },
          ...(curBlock
            ? [
                {
                  icon: <FaStopCircle style={{ fontSize: "20px" }} />,
                  label: "Quit Block",
                  onClick: () => setQuitDialogOpen(true),
                  variant: "danger",
                } as FooterAction,
              ]
            : []),
        ];

  return <ActionsFooter actions={footerActions} />;
};
