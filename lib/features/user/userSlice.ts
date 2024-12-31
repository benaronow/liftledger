import { createAppSlice } from "@/lib/createAppSlice";
import {
  loginUserRequest,
  deleteUserRequest,
  createUserRequest,
  blockOpRequest,
} from "./userAPI";
import { Block, BlockOp, User } from "@/types";
import { PayloadAction } from "@reduxjs/toolkit";

export interface UserSliceState {
  attemptedLogin: boolean;
  curUser: User | undefined;
  status: "idle" | "loading" | "failed";
}

const initialState: UserSliceState = {
  attemptedLogin: false,
  curUser: undefined,
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
    createUser: create.asyncThunk(
      async (user: {
        email: string;
        firstName: string;
        lastName: string;
        birthday: Date;
        benchMax: number;
        squatMax: number;
        deadMax: number;
        blocks: Block[];
        curBlock: Block | undefined;
      }) => {
        const response: User = await createUserRequest(user);
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
      async (data: { uid: string; block: Block; type: BlockOp }) => {
        const response: Block = await blockOpRequest({
          uid: data.uid,
          block: data.block,
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
    setCurBlock: create.reducer((state, action: PayloadAction<Block | undefined>) => {
      if (state.curUser) state.curUser.curBlock = action.payload;
    }),
    setCurWeek: create.reducer((state, action: PayloadAction<number>) => {
      if (state.curUser) state.curUser.curWeek = action.payload;
    }),
    setCurDay: create.reducer((state, action: PayloadAction<number>) => {
      if (state.curUser) state.curUser.curDay = action.payload;
    }),
    setCurExercise: create.reducer((state, action: PayloadAction<number>) => {
      if (state.curUser) state.curUser.curExercise = action.payload;
    }),
  }),
  selectors: {
    selectAttemptedLogin: (state) => state.attemptedLogin,
    selectCurUser: (state) => state.curUser,
    selectStatus: (state) => state.status,
  },
});

export const {
  loginUser,
  createUser,
  deleteUser,
  blockOp,
  setCurBlock,
  setCurWeek,
  setCurDay,
  setCurExercise,
} = userSlice.actions;

export const {
  selectAttemptedLogin,
  selectCurUser,
  selectStatus,
} = userSlice.selectors;
