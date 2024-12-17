import { Request } from "express";
import { ObjectId } from "mongodb";
import { Server } from "socket.io";

export type FitnessLogSocket = Server<ServerToClientEvents>;

export interface ServerToClientEvents {
  usersUpdate: (username: string) => void;
}

export interface User {
    _id?: ObjectId;
    username: string;
    password: string;
    favExercise: string;
}

export interface CreateUserRequest extends Request {
  body: User;
}

export interface DeleteUserRequest extends Request {
  query: {
    username: string
  };
}

export interface GetUserRequest extends Request {
  body: {
    username: string
  };
}

export type UserResponse = User | { error: string };

export type UsersResponse = User[] | {error: string};

export type DeleteResponse = { acknowledged: boolean; deletedCount: number } | { error: string }
