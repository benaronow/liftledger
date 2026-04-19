import { ActionDialog, DialogAction } from "@/app/components/ActionDialog";
import { useBlock } from "@/app/providers/BlockProvider";
import { useEditBlock } from "../EditBlockProvider";
import { IoArrowBack } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

export const DeleteDayDialog = () => {
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useBlock();
  const { deletingDayIdx, setDeletingDayIdx } = useEditBlock();

  const handleRemoveDay = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingDayIdx !== undefined
          ? week.toSpliced(deletingDayIdx, 1)
          : week,
      ),
    });
    setDeletingDayIdx(undefined);
  };

  const deleteActions: DialogAction[] = [
    {
      icon: <IoArrowBack fontSize={28} />,
      onClick: () => setDeletingDayIdx(undefined),
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
          onClose={() => setDeletingDayIdx(undefined)}
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
