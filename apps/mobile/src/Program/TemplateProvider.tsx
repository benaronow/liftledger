import { Program } from "@liftledger/shared";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { TemplateErrors, validateTemplate } from "./validateTemplate";
import { emptyProgram } from "./emptyProgram";

interface TemplateContextModel {
  templateProgram: Program;
  setTemplateProgram: Dispatch<SetStateAction<Program>>;
  unsetTemplateProgram: () => void;
  editingRotationIdx: number;
  setEditingRotationIdx: Dispatch<SetStateAction<number>>;
  editingSessionIdx: number;
  setEditingSessionIdx: Dispatch<SetStateAction<number>>;
  templateErrors: TemplateErrors;
  dirty: boolean;
  resetTemplate: () => void;
  commitBaseline: (program: Program) => void;
}

const defaultTemplateContext: TemplateContextModel = {
  templateProgram: emptyProgram(),
  setTemplateProgram: () => {},
  unsetTemplateProgram: () => {},
  editingRotationIdx: 0,
  setEditingRotationIdx: () => {},
  editingSessionIdx: -1,
  setEditingSessionIdx: () => {},
  templateErrors: { program: {}, sessions: [] },
  dirty: false,
  resetTemplate: () => {},
  commitBaseline: () => {},
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
  const [editingRotationIdx, setEditingRotationIdx] =
    useState(initialRotationIdx);
  const [editingSessionIdx, setEditingSessionIdx] = useState(-1);
  const [baseline, setBaseline] = useState(initialTemplate);

  const unsetTemplateProgram = () => setTemplateProgram(emptyProgram());

  const dirty = useMemo(
    () => JSON.stringify(templateProgram) !== JSON.stringify(baseline),
    [templateProgram, baseline],
  );

  const resetTemplate = useCallback(() => {
    setTemplateProgram(baseline);
    setEditingRotationIdx(initialRotationIdx);
    setEditingSessionIdx(-1);
  }, [baseline, initialRotationIdx]);

  const commitBaseline = useCallback((program: Program) => {
    setBaseline(program);
    setTemplateProgram(program);
  }, []);

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
        dirty,
        resetTemplate,
        commitBaseline,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => useContext(TemplateContext);
