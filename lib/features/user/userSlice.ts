import { createAppSlice } from "@/lib/createAppSlice";
import {
  loginUserRequest,
  deleteUserRequest,
  getAllUsersRequest,
  createUserRequest,
} from "./userAPI";
import { User } from "@/types";

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
        curBenchMax: number;
        curSquatMax: number;
        curDeadMax: number;
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

export const { loginUser, createUser, deleteUser, getAllUsers } =
  userSlice.actions;

export const {
  selectAttemptedLogin,
  selectCurUser,
  selectUsers,
  selectStatus,
} = userSlice.selectors;
