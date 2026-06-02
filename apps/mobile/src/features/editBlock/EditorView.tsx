import { EditDay } from "./EditDay/EditDay";
import { EditWeek } from "./EditWeek/EditWeek";
import { useTemplate } from "./TemplateProvider";

export const EditorView = () => {
  const { editingDayIdx } = useTemplate();

  return editingDayIdx === -1 ? <EditWeek /> : <EditDay />;
};
