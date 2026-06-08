import { useState } from "react";
import { MdArrowBackIosNew } from "react-icons/md";
import { FaSave, FaStopCircle } from "react-icons/fa";
import { ActionsFooter, FooterAction } from "@/components/ActionsFooter";
import { useTemplate } from "../TemplateProvider";
import { useMe, useProgram } from "@liftledger/api-client";
import { SaveProgramDialog } from "./SaveProgramDialog";
import { QuitProgramDialog } from "./QuitProgramDialog";

export const EditProgramFooter = () => {
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
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
          ...(curProgram
            ? [
                {
                  icon: <FaStopCircle style={{ fontSize: "20px" }} />,
                  label: "Quit Program",
                  onClick: () => setQuitDialogOpen(true),
                  variant: "danger",
                } as FooterAction,
              ]
            : []),
        ];

  return (
    <>
      <ActionsFooter actions={footerActions} />
      <SaveProgramDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      />
      <QuitProgramDialog
        open={quitDialogOpen}
        onClose={() => setQuitDialogOpen(false)}
      />
    </>
  );
};
