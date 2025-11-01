import { Block } from "@/lib/types";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./UserProvider";
import api from "@/lib/config";

const BLOCK_API_URL = "/api/block";

export const EMPTY_BLOCK: Block = {
  name: "",
  startDate: new Date(),
  length: 0,
  weeks: [
    [
      {
        name: "Day 1",
        exercises: [
          {
            name: "",
            apparatus: "",
            sets: [
              {
                reps: 0,
                weight: 0,
                completed: false,
                note: "",
              },
            ],
            weightType: "",
          },
        ],
        completedDate: undefined,
      },
    ],
  ],
  curDayIdx: 0,
  curWeekIdx: 0,
};

interface BlockContextType {
  curBlock?: Block;
  curBlockLoading: boolean;
  templateBlock: Block;
  setTemplateBlock: Dispatch<SetStateAction<Block>>;
  unsetTemplateBlock: () => void;
  editingWeekIdx: number;
  setEditingWeekIdx: Dispatch<SetStateAction<number>>;
  createBlock: (block: Block) => Promise<void>;
  updateBlock: (block: Block) => Promise<void>;
}

const defaultBlockContext: BlockContextType = {
  curBlockLoading: true,
  templateBlock: EMPTY_BLOCK,
  setTemplateBlock: () => {},
  unsetTemplateBlock: () => {},
  editingWeekIdx: 0,
  setEditingWeekIdx: () => {},
  createBlock: async () => {},
  updateBlock: async () => {},
};

export const BlockContext = createContext(defaultBlockContext);

export const BlockProvider = ({ children }: PropsWithChildren<object>) => {
  const { session, curUser, getUser } = useUser();
  const [curBlock, setCurBlock] = useState<Block>();
  const [curBlockLoading, setCurBlockLoading] = useState(true);
  const [templateBlock, setTemplateBlock] = useState<Block>(EMPTY_BLOCK);
  const [editingWeekIdx, setEditingWeekIdx] = useState(0);

  const unsetTemplateBlock = () => {
    setTemplateBlock(EMPTY_BLOCK);
  };

  const getCurBlock = async () => {
    setCurBlockLoading(true);
    if (!curUser || !curUser.curBlock) {
      setCurBlockLoading(false);
      return;
    }
    const res = await api.get(`${BLOCK_API_URL}/${curUser.curBlock}`);
    const result: Block = res.data;
    setCurBlock(result);
    setCurBlockLoading(false);
  };

  useEffect(() => {
    getCurBlock();
  }, [curUser]);

  const createBlock = async (block: Block) => {
    if (!curUser || !curUser._id) return;
    const res = await api.post(`${BLOCK_API_URL}`, {
      uid: curUser._id,
      block,
    });
    const result: Block = res.data;
    setCurBlock(result);
  };

  const updateBlock = async (block: Block) => {
    if (!curUser || !curUser._id) return;
    const res = await api.put(`${BLOCK_API_URL}/${block._id}`, {
      uid: curUser._id,
      block,
    });
    const result: { block: Block; done: boolean } = res.data;
    if (result.done) {
      setCurBlock(undefined);
      getUser(session?.user.email || "");
    } else {
      setCurBlock(result.block);
    }
  };

  return (
    <BlockContext.Provider
      value={{
        curBlock,
        curBlockLoading,
        templateBlock,
        setTemplateBlock,
        unsetTemplateBlock,
        editingWeekIdx,
        setEditingWeekIdx,
        createBlock,
        updateBlock,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

export const useBlock = () => useContext(BlockContext);
