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
import { validateTemplate } from "./validateTemplate";
import { EMPTY_PROGRAM } from "./emptyProgram";

interface TemplateContextModel {
  templateProgram: Program;
  setTemplateProgram: Dispatch<SetStateAction<Program>>;
  unsetTemplateProgram: () => void;
  editingWeekIdx: number;
  setEditingWeekIdx: Dispatch<SetStateAction<number>>;
  editingDayIdx: number;
  setEditingDayIdx: Dispatch<SetStateAction<number>>;
  templateErrors: string[];
}

const defaultTemplateContext: TemplateContextModel = {
  templateProgram: EMPTY_PROGRAM,
  setTemplateProgram: () => {},
  unsetTemplateProgram: () => {},
  editingWeekIdx: 0,
  setEditingWeekIdx: () => {},
  editingDayIdx: -1,
  setEditingDayIdx: () => {},
  templateErrors: [],
};

const TemplateContext = createContext<TemplateContextModel>(
  defaultTemplateContext,
);

interface Props extends PropsWithChildren {
  initialTemplate: Program;
  initialWeekIdx: number;
}

export const TemplateProvider = ({
  initialTemplate,
  initialWeekIdx,
  children,
}: Props) => {
  const [templateProgram, setTemplateProgram] = useState<Program>(initialTemplate);
  const [editingWeekIdx, setEditingWeekIdx] = useState(initialWeekIdx);
  const [editingDayIdx, setEditingDayIdx] = useState(-1);

  const unsetTemplateProgram = () => setTemplateProgram(EMPTY_PROGRAM);

  const templateErrors = useMemo(
    () => validateTemplate(templateProgram, editingWeekIdx),
    [templateProgram, editingWeekIdx],
  );

  return (
    <TemplateContext.Provider
      value={{
        templateProgram,
        setTemplateProgram,
        unsetTemplateProgram,
        editingWeekIdx,
        setEditingWeekIdx,
        editingDayIdx,
        setEditingDayIdx,
        templateErrors,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => useContext(TemplateContext);
