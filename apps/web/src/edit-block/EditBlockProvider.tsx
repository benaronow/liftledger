import { Block } from "@/lib/types";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useCompletedExercises,
  useMe,
  useUserBlock,
} from "@liftledger/api-client";
import { validateTemplate } from "./validateTemplate";
import { EMPTY_BLOCK } from "./emptyBlock";
import { templateFromBlock } from "./templateFromBlock";

interface EditBlockContextModel {
  templateBlock: Block;
  setTemplateBlock: Dispatch<SetStateAction<Block>>;
  unsetTemplateBlock: () => void;
  editingWeekIdx: number;
  setEditingWeekIdx: Dispatch<SetStateAction<number>>;
  editingDayIdx: number;
  setEditingDayIdx: Dispatch<SetStateAction<number>>;
  saveDialogOpen: boolean;
  setSaveDialogOpen: Dispatch<SetStateAction<boolean>>;
  quitDialogOpen: boolean;
  setQuitDialogOpen: Dispatch<SetStateAction<boolean>>;
  templateErrors: string[];
  deletingDayIdx: number | undefined;
  setDeletingDayIdx: Dispatch<SetStateAction<number | undefined>>;
  deletingExerciseIdx: number | undefined;
  setDeletingExerciseIdx: Dispatch<SetStateAction<number | undefined>>;
}

const defaultEditBlockContext: EditBlockContextModel = {
  templateBlock: EMPTY_BLOCK,
  setTemplateBlock: () => {},
  unsetTemplateBlock: () => {},
  editingWeekIdx: 0,
  setEditingWeekIdx: () => {},
  editingDayIdx: -1,
  setEditingDayIdx: () => {},
  saveDialogOpen: false,
  setSaveDialogOpen: () => {},
  quitDialogOpen: false,
  setQuitDialogOpen: () => {},
  templateErrors: [],
  deletingDayIdx: undefined,
  setDeletingDayIdx: () => {},
  deletingExerciseIdx: undefined,
  setDeletingExerciseIdx: () => {},
};

const EditBlockContext = createContext<EditBlockContextModel>(
  defaultEditBlockContext,
);

interface Props extends PropsWithChildren {
  // The block id to duplicate from, taken from /edit-block's `duplicateFrom`
  // query param. Page-level component reads searchParams and passes it through
  // both as a prop AND as the React key on this provider — when the user
  // navigates to a different duplicate URL, the key change remounts the
  // provider with fresh state.
  duplicateFromId?: string | null;
}

export const EditBlockProvider = ({ children, duplicateFromId }: Props) => {
  const { data: curUser } = useMe();
  const { data: curBlock, isLoading: curBlockLoading } = useUserBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const { data: completedExercises } = useCompletedExercises(curUser?._id);

  const sourceBlock = useMemo(() => {
    if (!duplicateFromId || !curUser?.blocks) return null;
    return curUser.blocks.find((b) => b._id === duplicateFromId) ?? null;
  }, [duplicateFromId, curUser?.blocks]);

  const [templateBlock, setTemplateBlock] = useState<Block>(EMPTY_BLOCK);
  const [editingWeekIdx, setEditingWeekIdx] = useState(0);
  const [editingDayIdx, setEditingDayIdx] = useState(-1);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);
  const [deletingDayIdx, setDeletingDayIdx] = useState<number | undefined>(
    undefined,
  );
  const [deletingExerciseIdx, setDeletingExerciseIdx] = useState<
    number | undefined
  >(undefined);
  const [seeded, setSeeded] = useState(false);

  // Seed templateBlock once per mount based on URL + server state.
  // Strict mode runs the effect twice; that's harmless here because:
  //   1. The seeding decision is deterministic (same inputs → same template)
  //   2. After the first run flips `seeded=true`, the second run's `if (seeded)`
  //      bail-out kicks in via the dependency-driven re-render.
  // (In strict mode's same-render double-run, both setups produce the same
  // value, so the second write is a no-op state-wise.)
  useEffect(() => {
    if (seeded) return;
    if (!curUser) return;

    if (duplicateFromId) {
      // Wait for the source block + completedExercises before seeding so the
      // duplicate's set numbers reflect the user's latest progress.
      if (!sourceBlock || !completedExercises) return;
      setTemplateBlock(templateFromBlock(sourceBlock, completedExercises));
      setEditingWeekIdx(0);
      setSeeded(true);
      return;
    }

    // No duplicate URL: seed from curBlock, or fall through to EMPTY_BLOCK if
    // there's confirmed no curBlock (creating a new one from scratch).
    if (curBlock) {
      setTemplateBlock(curBlock);
      setEditingWeekIdx(curBlock.curWeekIdx);
      setSeeded(true);
    } else if (!curBlockLoading) {
      setSeeded(true);
    }
  }, [
    seeded,
    curUser,
    duplicateFromId,
    sourceBlock,
    completedExercises,
    curBlock,
    curBlockLoading,
  ]);

  const unsetTemplateBlock = () => setTemplateBlock(EMPTY_BLOCK);

  const templateErrors = useMemo(
    () => validateTemplate(templateBlock, editingWeekIdx),
    [templateBlock, editingWeekIdx],
  );

  return (
    <EditBlockContext.Provider
      value={{
        templateBlock,
        setTemplateBlock,
        unsetTemplateBlock,
        editingWeekIdx,
        setEditingWeekIdx,
        editingDayIdx,
        setEditingDayIdx,
        saveDialogOpen,
        setSaveDialogOpen,
        quitDialogOpen,
        setQuitDialogOpen,
        templateErrors,
        deletingDayIdx,
        setDeletingDayIdx,
        deletingExerciseIdx,
        setDeletingExerciseIdx,
      }}
    >
      {children}
    </EditBlockContext.Provider>
  );
};

export const useEditBlock = () => useContext(EditBlockContext);
