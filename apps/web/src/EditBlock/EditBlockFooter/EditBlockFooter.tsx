import { useState } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { FaSave, FaStopCircle } from "react-icons/fa";
import { ActionsFooter, FooterAction } from "@/components/ActionsFooter";
import { useTemplate } from "../TemplateProvider";
import { useMe, useBlock } from "@liftledger/api-client";
import { SaveBlockDialog } from "./SaveBlockDialog";
import { QuitBlockDialog } from "./QuitBlockDialog";

export const EditBlockFooter = () => {
  const { data: curUser } = useMe();
  const { data: curBlock } = useBlock(curUser?._id, curUser?.curBlock);
  const { editingDayIdx, setEditingDayIdx, templateErrors } = useTemplate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

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

  return (
    <>
      <ActionsFooter actions={footerActions} />
      <SaveBlockDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      />
      <QuitBlockDialog
        open={quitDialogOpen}
        onClose={() => setQuitDialogOpen(false)}
      />
    </>
  );
};
