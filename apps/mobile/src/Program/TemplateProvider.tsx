import { Program } from "@liftledger/shared";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { TemplateErrors, validateTemplate } from "./validateTemplate";
import { EMPTY_PROGRAM } from "./emptyProgram";

interface TemplateContextModel {
  templateProgram: Program;
  setTemplateProgram: Dispatch<SetStateAction<Program>>;
  unsetTemplateProgram: () => void;
  editingRotationIdx: number;
  setEditingRotationIdx: Dispatch<SetStateAction<number>>;
  editingSessionIdx: number;
  setEditingSessionIdx: Dispatch<SetStateAction<number>>;
  templateErrors: TemplateErrors;
}

const defaultTemplateContext: TemplateContextModel = {
  templateProgram: EMPTY_PROGRAM,
  setTemplateProgram: () => {},
  unsetTemplateProgram: () => {},
  editingRotationIdx: 0,
  setEditingRotationIdx: () => {},
  editingSessionIdx: -1,
  setEditingSessionIdx: () => {},
  templateErrors: { program: {}, sessions: [] },
};

const TemplateContext = createContext<TemplateContextModel>(
  defaultTemplateContext,
);

interface Props extends PropsWithChildren {
  initialTemplate: Program;
  initialRotationIdx: number;
}

export const TemplateProvider = ({
  initialTemplate,
  initialRotationIdx,
  children,
}: Props) => {
  const [templateProgram, setTemplateProgram] =
    useState<Program>(initialTemplate);
  const [editingRotationIdx, setEditingRotationIdx] = useState(initialRotationIdx);
  const [editingSessionIdx, setEditingSessionIdx] = useState(-1);

  const unsetTemplateProgram = () => setTemplateProgram(EMPTY_PROGRAM);

  const templateErrors = useMemo(
    () => validateTemplate(templateProgram, editingRotationIdx),
    [templateProgram, editingRotationIdx],
  );

  return (
    <TemplateContext.Provider
      value={{
        templateProgram,
        setTemplateProgram,
        unsetTemplateProgram,
        editingRotationIdx,
        setEditingRotationIdx,
        editingSessionIdx,
        setEditingSessionIdx,
        templateErrors,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => useContext(TemplateContext);
