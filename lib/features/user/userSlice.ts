import { createAppSlice } from "@/lib/createAppSlice";
import {
  loginUserRequest,
  deleteUserRequest,
  blockOpRequest,
  updateUserRequest,
} from "./userAPI";
import { Block, BlockOp, User } from "@/types";
import { PayloadAction } from "@reduxjs/toolkit";

export interface UserSliceState {
  attemptedLogin: boolean;
  curUser: User | undefined;
  template: Block | undefined;
  editingBlock: boolean;
  messageOpen: boolean;
  status: "idle" | "loading" | "failed";
}

const initialState: UserSliceState = {
  attemptedLogin: false,
  curUser: undefined,
  template: undefined,
  editingBlock: false,
  messageOpen: false,
  status: "idle",
};

export const userSlice = createAppSlice({
  name: "user",
  initialState,
  reducers: (create) => ({
    loginUser: create.asyncThunk(
      async (email: string) => {
        const response: User = await loginUserRequest(email);
        return response;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.attemptedLogin = true;
          state.curUser = action.payload;
        },
        rejected: (state) => {
          state.status = "failed";
        },
      }
    ),
    updateUser: create.asyncThunk(
      async (user: {
        email: string;
        firstName: string;
        lastName: string;
        birthday: Date;
        blocks: Block[];
        curBlock: string;
      }) => {
        const response: User = await updateUserRequest(user);
        return response;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.curUser = action.payload;
        },
        rejected: (state) => {
          state.status = "failed";
        },
      }
    ),
    deleteUser: create.asyncThunk(
      async (email: string) => {
        const response: { acknowledged: boolean; deletedCount: number } =
          await deleteUserRequest(email);

        return response;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state) => {
          state.status = "idle";
        },
        rejected: (state) => {
          state.status = "failed";
        },
      }
    ),
    blockOp: create.asyncThunk(
      async (data: {
        uid: string;
        block: Block;
        curWeek: number;
        type: BlockOp;
      }) => {
        const response: Block = await blockOpRequest({
          uid: data.uid,
          block: data.block,
          curWeek: data.curWeek,
          type: data.type,
        });
        return response;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          if (state.curUser) {
            state.curUser.curBlock = action.payload._id || "";
            state.curUser.blocks = [
              ...state.curUser.blocks.filter(
                (block) => block._id !== action.payload._id
              ),
              action.payload,
            ];
          }
        },
        rejected: (state) => {
          state.status = "failed";
        },
      }
    ),
    setTemplate: create.reducer(
      (state, action: PayloadAction<Block | undefined>) => {
        state.template = action.payload;
      }
    ),
    setEditingBlock: create.reducer((state, action: PayloadAction<boolean>) => {
      state.editingBlock = action.payload;
    }),
    setMessageOpen: create.reducer((state, action: PayloadAction<boolean>) => {
      state.messageOpen = action.payload;
    }),
    setCurBlock: create.reducer((state, action: PayloadAction<string>) => {
      if (state.curUser) state.curUser.curBlock = action.payload;
    }),
    setCurWeek: create.reducer(
      (state, action: PayloadAction<number | undefined>) => {
        if (state.curUser) state.curUser.curWeekIdx = action.payload;
      }
    ),
    setCurDay: create.reducer(
      (state, action: PayloadAction<number | undefined>) => {
        if (state.curUser) state.curUser.curDayIdx = action.payload;
      }
    ),
  }),
  selectors: {
    selectAttemptedLogin: (state) => state.attemptedLogin,
    selectCurUser: (state) => state.curUser,
    selectCurBlock: (state) =>
      state.curUser?.blocks.find(
        (block) => block._id === state.curUser?.curBlock
      ),
    selectTemplate: (state) => state.template,
    selectEditingBlock: (state) => state.editingBlock,
    selectMessageOpen: (state) => state.messageOpen,
    selectStatus: (state) => state.status,
  },
});

export const {
  loginUser,
  updateUser,
  deleteUser,
  blockOp,
  setTemplate,
  setEditingBlock,
  setMessageOpen,
  setCurBlock,
  setCurWeek,
  setCurDay,
} = userSlice.actions;

export const {
  selectAttemptedLogin,
  selectCurUser,
  selectCurBlock,
  selectTemplate,
  selectEditingBlock,
  selectMessageOpen,
  selectStatus,
} = userSlice.selectors;
