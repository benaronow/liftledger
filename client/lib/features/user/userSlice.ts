import { createAppSlice } from "@/lib/createAppSlice";
import type { AppThunk } from "@/lib/store";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createUserRequest, getAllUsersRequest, getUserRequest } from "./userAPI";
import { User } from "@/types";

export interface UserSliceState {
  curUser: User | undefined;
  users: User[] | undefined;
  status: "idle" | "loading" | "failed";
}

const initialState: UserSliceState = {
  curUser: undefined,
  users: undefined,
  status: "idle",
};

export const userSlice = createAppSlice({
  name: "user",
  initialState,
  reducers: (create) => ({
    createUser: create.asyncThunk(
      async (data: {
        username: string;
        password: string;
        favExercise: string;
      }) => {
        const response: User = await createUserRequest(
          data.username,
          data.password,
          data.favExercise
        );

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
    getUser: create.asyncThunk(
      async (username: string) => {
        const response: User = await getUserRequest(username);

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
    selectCurUser: (state) => state.curUser,
    selectUsers: (state) => state.users,
    selectStatus: (state) => state.status,
  },
});

// Action creators are generated for each case reducer function.
export const { createUser, getUser, getAllUsers } = userSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectCurUser, selectStatus } = userSlice.selectors;
