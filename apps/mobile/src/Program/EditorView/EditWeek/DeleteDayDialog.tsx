import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  deletingDayIdx: number | undefined;
  onClose: () => void;
}

export const DeleteDayDialog = ({ deletingDayIdx, onClose }: Props) => {
  const { templateProgram, setTemplateProgram, editingWeekIdx } = useTemplate();

  const handleRemoveDay = () => {
    setTemplateProgram({
      ...templateProgram,
      weeks: templateProgram.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingDayIdx !== undefined
          ? week.toSpliced(deletingDayIdx, 1)
          : week,
      ),
    });
    onClose();
  };

  if (deletingDayIdx === undefined) return null;

  return (
    <ConfirmationDialog
      open={deletingDayIdx !== undefined}
      onClose={onClose}
      title="Delete Day"
      icon="alert"
      destructive
      onConfirm={handleRemoveDay}
      description="Are you sure you want to delete this day?"
      emphasis="This action cannot be undone."
    />
  );
};
