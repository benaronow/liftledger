import { createAppSlice } from "@/lib/createAppSlice";
import {
  loginUserRequest,
  deleteUserRequest,
  blockOpRequest,
  updateUserRequest,
} from "./userAPI";
import { Block, BlockOp, ExerciseProgress, User } from "@/types";
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
        benchMax: number;
        squatMax: number;
        deadMax: number;
        progress: ExerciseProgress;
        blocks: Block[];
        curBlock: Block | undefined;
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
          if (state.curUser) {
            state.curUser.progress = action.payload.progress;
          } else {
            state.curUser = action.payload;
          }
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
            state.curUser.curBlock = action.payload;
            state.curUser.blocks.push(action.payload);
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
    setCurBlock: create.reducer(
      (state, action: PayloadAction<Block | undefined>) => {
        if (state.curUser) state.curUser.curBlock = action.payload;
      }
    ),
    setCurWeek: create.reducer(
      (state, action: PayloadAction<number | undefined>) => {
        if (state.curUser) state.curUser.curWeek = action.payload;
      }
    ),
    setCurDay: create.reducer(
      (state, action: PayloadAction<number | undefined>) => {
        if (state.curUser) state.curUser.curDay = action.payload;
      }
    ),
    setCurExercise: create.reducer(
      (state, action: PayloadAction<number | undefined>) => {
        if (state.curUser) state.curUser.curExercise = action.payload;
      }
    ),
  }),
  selectors: {
    selectAttemptedLogin: (state) => state.attemptedLogin,
    selectCurUser: (state) => state.curUser,
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
  setCurExercise,
} = userSlice.actions;

export const {
  selectAttemptedLogin,
  selectCurUser,
  selectTemplate,
  selectEditingBlock,
  selectMessageOpen,
  selectStatus,
} = userSlice.selectors;
