import { Block } from "@liftledger/shared";
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
import { EMPTY_BLOCK } from "./emptyBlock";

interface TemplateContextModel {
  templateBlock: Block;
  setTemplateBlock: Dispatch<SetStateAction<Block>>;
  unsetTemplateBlock: () => void;
  editingWeekIdx: number;
  setEditingWeekIdx: Dispatch<SetStateAction<number>>;
  editingDayIdx: number;
  setEditingDayIdx: Dispatch<SetStateAction<number>>;
  templateErrors: string[];
}

const defaultTemplateContext: TemplateContextModel = {
  templateBlock: EMPTY_BLOCK,
  setTemplateBlock: () => {},
  unsetTemplateBlock: () => {},
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
  initialTemplate: Block;
  initialWeekIdx: number;
}

export const TemplateProvider = ({
  initialTemplate,
  initialWeekIdx,
  children,
}: Props) => {
  const [templateBlock, setTemplateBlock] = useState<Block>(initialTemplate);
  const [editingWeekIdx, setEditingWeekIdx] = useState(initialWeekIdx);
  const [editingDayIdx, setEditingDayIdx] = useState(-1);

  const unsetTemplateBlock = () => setTemplateBlock(EMPTY_BLOCK);

  const templateErrors = useMemo(
    () => validateTemplate(templateBlock, editingWeekIdx),
    [templateBlock, editingWeekIdx],
  );

  return (
    <TemplateContext.Provider
      value={{
        templateBlock,
        setTemplateBlock,
        unsetTemplateBlock,
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
