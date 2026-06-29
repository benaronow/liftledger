import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { useTemplate } from "../../TemplateProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

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

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: onClose,
      variant: "dangerInverted",
    },
    {
      icon: <FaTrash fontSize={26} />,
      onClick: handleRemoveSession,
      variant: "danger",
    },
  ];

  return (
    <>
      {deletingSessionIdx !== undefined && (
        <ActionDialog
          open={deletingSessionIdx !== undefined}
          onClose={onClose}
          title="Delete Session"
          actions={deleteActions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to delete this session?
            </span>
            <strong className="text-white text-wrap">
              This action cannot be undone.
            </strong>
          </div>
        </ActionDialog>
      )}
    </>
  );
};
