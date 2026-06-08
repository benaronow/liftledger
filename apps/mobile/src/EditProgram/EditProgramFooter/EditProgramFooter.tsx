import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useProgram, useMe } from "@liftledger/api-client";
import { useState } from "react";
import { ActionsFooter, FooterAction } from "../../components/ActionsFooter";
import { QuitProgramDialog } from "./QuitProgramDialog";
import { SaveProgramDialog } from "./SaveProgramDialog";
import { useTemplate } from "../TemplateProvider";

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
            icon: <MaterialCommunityIcons name="chevron-left" size={20} color="white" />,
            label: "Return to week",
            onPress: () => setEditingDayIdx(-1),
            variant: "primary",
          },
        ]
      : [
          {
            icon: <MaterialCommunityIcons name="content-save" size={18} color="white" />,
            label: "Save",
            onPress: () => setSaveDialogOpen(true),
            disabled: templateErrors.length > 0,
            variant: "primary",
          },
          ...(curProgram
            ? [
                {
                  icon: <MaterialCommunityIcons name="stop-circle" size={20} color="white" />,
                  label: "Quit Program",
                  onPress: () => setQuitDialogOpen(true),
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
