import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  deletingSessionIdx: number | undefined;
  onClose: () => void;
}

export const DeleteSessionDialog = ({ deletingSessionIdx, onClose }: Props) => {
  const { templateProgram, setTemplateProgram, editingRotationIdx } = useTemplate();

  const handleRemoveSession = () => {
    setTemplateProgram({
      ...templateProgram,
      rotations: templateProgram.rotations.map((rotation, idx) =>
        idx === editingRotationIdx && deletingSessionIdx !== undefined
          ? rotation.toSpliced(deletingSessionIdx, 1)
          : rotation,
      ),
    });
    onClose();
  };

  return (
    <ConfirmationDialog
      open={deletingSessionIdx !== undefined}
      onClose={onClose}
      title="Delete Session"
      icon="alert"
      destructive
      onConfirm={handleRemoveSession}
      description="Are you sure you want to delete this session?"
      emphasis="This action cannot be undone."
    />
  );
};
