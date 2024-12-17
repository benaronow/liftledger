/* eslint-disable @typescript-eslint/no-explicit-any */

import UserModel from "./models/user";
import { DeleteResponse, User, UserResponse, UsersResponse } from "./types";

export const createUser = async (user: User): Promise<UserResponse> => {
  try {
    const newUser = await UserModel.create(user);
    if (newUser === null) {
      throw new Error("Cannot create user");
    }

    return newUser;
  } catch (error: any) {
    return { error: error };
  }
};

export const deleteUser = async (username: string): Promise<DeleteResponse> => {
  try {
    const res = await UserModel.deleteOne({ username: username });
    if (res === null) {
      throw new Error(`Cannot delete user ${username}`);
    }

    return res;
  } catch (error: any) {
    return { error: error };
  }
}

export const getUser = async (username: string): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({ username: username });
    if (user === null) {
      throw new Error("User not found");
    }

    return user;
  } catch (error: any) {
    return { error: error };
  }
};

export const getAllUsers = async (): Promise<UsersResponse> => {
  try {
    const users = await UserModel.find();
    if (users === null) {
      throw new Error('Cannot get all users')
    }

    return users;
  } catch (error: any) {
    return { error: error };
  }
};
