import { EditDay } from "./EditDay";
import { EditWeek } from "./EditWeek";
import { useTemplate } from "../TemplateProvider";

export const EditorView = () => {
  const { editingDayIdx } = useTemplate();

  return editingDayIdx === -1 ? <EditWeek /> : <EditDay />;
};
