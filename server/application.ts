import UserModel from "./models/user";
import { User, UserResponse } from "./types";

export const createUser = async (user: User): Promise<UserResponse> => {
  try {
    const newUser = await UserModel.create(user);
    if (newUser === null) {
      throw new Error("Error when saving a user");
    }

    return newUser;
  } catch (error) {
    return { error: "Error when saving a user" };
  }
};

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

export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const result = await UserModel.find();
    return result;
  } catch (error) {
    return [{ error: "Error when fetching all users" }];
  }
};
