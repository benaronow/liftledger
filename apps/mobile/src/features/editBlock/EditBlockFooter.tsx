import { Ionicons } from "@expo/vector-icons";
import { useBlock, useMe } from "@liftledger/api-client";
import { useState } from "react";
import { ActionsFooter, FooterAction } from "../../components/ActionsFooter";
import { QuitBlockDialog } from "./QuitBlockDialog";
import { SaveBlockDialog } from "./SaveBlockDialog";
import { useTemplate } from "./TemplateProvider";

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
            icon: <Ionicons name="chevron-back" size={20} color="white" />,
            label: "Return to week",
            onPress: () => setEditingDayIdx(-1),
            variant: "primary",
          },
        ]
      : [
          {
            icon: <Ionicons name="save" size={18} color="white" />,
            label: "Save",
            onPress: () => setSaveDialogOpen(true),
            disabled: templateErrors.length > 0,
            variant: "primary",
          },
          ...(curBlock
            ? [
                {
                  icon: <Ionicons name="stop-circle" size={20} color="white" />,
                  label: "Quit Block",
                  onPress: () => setQuitDialogOpen(true),
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
