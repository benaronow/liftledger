import { Program } from "@liftledger/shared";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
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
  rebaseTemplate: (program: Program) => void;
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
  rebaseTemplate: () => {},
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

  const initialTemplateKey = useMemo(
    () => JSON.stringify(initialTemplate),
    [initialTemplate],
  );

  const rebaseTemplate = useCallback(
    (program: Program) => {
      setBaseline(program);
      setTemplateProgram(program);
    },
    [setBaseline, setTemplateProgram],
  );

  useEffect(() => {
    if (!dirty && initialTemplateKey !== JSON.stringify(baseline)) {
      rebaseTemplate(initialTemplate);
    }
  }, [baseline, dirty, initialTemplate, initialTemplateKey, rebaseTemplate]);

  const resetTemplate = useCallback(() => {
    setTemplateProgram(baseline);
    setEditingRotationIdx(initialRotationIdx);
    setEditingSessionIdx(-1);
  }, [baseline, initialRotationIdx]);

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
        rebaseTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => useContext(TemplateContext);
