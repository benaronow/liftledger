"use client";

import { Block } from "@/lib/types";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";
import { useUser } from "./UserProvider";
import { useUpdateUserBlock, useUserBlock } from "@liftledger/api-client";
import { AxiosError } from "axios";

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
  updateBlock: (block: Block) => Promise<void>;
}

const defaultBlockContext: BlockContextType = {
  curBlockLoading: true,
  templateBlock: EMPTY_BLOCK,
  setTemplateBlock: () => {},
  unsetTemplateBlock: () => {},
  editingWeekIdx: 0,
  setEditingWeekIdx: () => {},
  updateBlock: async () => {},
};

export const BlockContext = createContext(defaultBlockContext);

export const BlockProvider = ({ children }: PropsWithChildren<object>) => {
  const { curUser } = useUser();
  const { data: curBlock, isLoading: curBlockLoading } = useUserBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const [templateBlock, setTemplateBlock] = useState<Block>(EMPTY_BLOCK);
  const [editingWeekIdx, setEditingWeekIdx] = useState(0);
  const { trigger: triggerUpdateUserBlock } = useUpdateUserBlock();

  const unsetTemplateBlock = () => {
    setTemplateBlock(EMPTY_BLOCK);
  };

  const updateBlock = useCallback(
    async (block: Block) => {
      if (!curUser?._id || !block._id) return;
      try {
        await triggerUpdateUserBlock({ userId: curUser._id, block });
      } catch (e: unknown) {
        const error = (e as AxiosError<{ error?: string }>)?.response?.data
          ?.error;
        throw new Error(error ?? "Failed to update block");
      }
    },
    [curUser?._id, triggerUpdateUserBlock],
  );

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
        updateBlock,
      }}
    >
      {children}
    </BlockContext.Provider>
  );
};

export const useBlock = () => useContext(BlockContext);
