import { Block } from "@/app/types";
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
import api from "@/app/config";

const BLOCK_API_URL = "/api/block";

const EMPTY_BLOCK: Block = {
  name: "",
  startDate: new Date(),
  length: 0,
  initialWeek: [],
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
  templateBlock: Block;
  setTemplateBlock: Dispatch<SetStateAction<Block>>;
  unsetTemplateBlock: () => void;
  createBlock: (block: Block) => Promise<void>;
  editBlock: (block: Block) => Promise<void>;
}

const defaultBlockContext: BlockContextType = {
  templateBlock: EMPTY_BLOCK,
  setTemplateBlock: () => {},
  unsetTemplateBlock: () => {},
  createBlock: async () => {},
  editBlock: async () => {},
};

export const BlockContext = createContext(defaultBlockContext);

export const BlockProvider = ({ children }: PropsWithChildren<object>) => {
  const { curUser } = useUser();
  const [curBlock, setCurBlock] = useState<Block>();
  const [templateBlock, setTemplateBlock] = useState<Block>(EMPTY_BLOCK);

  const unsetTemplateBlock = () => {
    setTemplateBlock(EMPTY_BLOCK);
  };

  const getCurBlock = async () => {
    if (!curUser || !curUser.curBlock) return;
    const res = await api.get(`${BLOCK_API_URL}/${curUser.curBlock}`);
    const result: Block = res.data;
    setCurBlock(result);
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

  const editBlock = async (block: Block) => {
    if (!curUser || !curUser._id) return;
    const res = await api.put(`${BLOCK_API_URL}/${block._id}`, {
      uid: curUser._id,
      block,
    });
    const result: { block: Block; done: boolean } = res.data;
    if (result.done) {
      setCurBlock(undefined);
    } else {
      setCurBlock(result.block);
    }
  };

  return (
    <BlockContext.Provider
      value={{
        curBlock,
        templateBlock,
        setTemplateBlock,
        unsetTemplateBlock,
        createBlock,
        editBlock,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

export const useBlock = () => useContext(BlockContext);
