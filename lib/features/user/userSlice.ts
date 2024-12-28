import { createAppSlice } from "@/lib/createAppSlice";
import {
  loginUserRequest,
  deleteUserRequest,
  getAllUsersRequest,
  createUserRequest,
  addBlockRequest,
} from "./userAPI";
import { Block, User } from "@/types";

export interface UserSliceState {
  attemptedLogin: boolean;
  curUser: User | undefined;
  users: User[];
  status: "idle" | "loading" | "failed";
}

const initialState: UserSliceState = {
  attemptedLogin: false,
  curUser: undefined,
  users: [],
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
    getAllUsers: create.asyncThunk(
      async () => {
        const response: User[] = await getAllUsersRequest();
        return response;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.users = action.payload;
        },
        rejected: (state) => {
          state.status = "failed";
        },
      }
    ),
    addBlock: create.asyncThunk(
      async (data: { uid: string; block: Block }) => {
        const response: User | undefined = await addBlockRequest({
          uid: data.uid,
          block: data.block,
        });
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
  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectAttemptedLogin: (state) => state.attemptedLogin,
    selectCurUser: (state) => state.curUser,
    selectUsers: (state) => state.users,
    selectStatus: (state) => state.status,
  },
});

export const { loginUser, createUser, deleteUser, getAllUsers, addBlock } =
  userSlice.actions;

export const {
  selectAttemptedLogin,
  selectCurUser,
  selectUsers,
  selectStatus,
} = userSlice.selectors;
