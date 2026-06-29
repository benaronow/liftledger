import { EditSession } from "./EditSession";
import { EditRotation } from "./EditRotation";
import { useTemplate } from "../TemplateProvider";

export const EditorView = () => {
  const { editingSessionIdx } = useTemplate();

  return editingSessionIdx === -1 ? <EditRotation /> : <EditSession />;
};
