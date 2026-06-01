import { ActionDialog, DialogAction } from "@/components/ActionDialog";
import { useTemplate } from "../../TemplateProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

interface Props {
  deletingDayIdx: number | undefined;
  onClose: () => void;
}

export const DeleteDayDialog = ({ deletingDayIdx, onClose }: Props) => {
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useTemplate();

  const handleRemoveDay = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingDayIdx !== undefined
          ? week.toSpliced(deletingDayIdx, 1)
          : week,
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
      onClick: handleRemoveDay,
      variant: "danger",
    },
  ];

  return (
    <>
      {deletingDayIdx !== undefined && (
        <ActionDialog
          open={deletingDayIdx !== undefined}
          onClose={onClose}
          title="Delete Day"
          actions={deleteActions}
        >
          <div className="d-flex flex-column">
            <span className="text-white text-wrap mb-4">
              Are you sure you want to delete this day?
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
