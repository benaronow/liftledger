/* eslint-disable @typescript-eslint/no-explicit-any */

import express, { Response } from "express";
import {
  User,
  CreateUserRequest,
  FitnessLogSocket,
  GetUserRequest,
  DeleteUserRequest,
} from "../types";
import { createUser, deleteUser, getAllUsers, getUser } from "../application";

const userController = (socket: FitnessLogSocket) => {
  const router = express.Router();

  const createUserEndpoint = async (
    req: CreateUserRequest,
    res: Response
  ): Promise<void> => {
    const user: User = req.body;

    try {
      const result = await createUser(user);
      if ("error" in result) {
        throw new Error(result.error);
      }

      socket.emit('usersUpdate', user.username);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(500).send(`Error when creating user: ${error.message}`);
      } else {
        res.status(500).send(`Error when creating user`);
      }
    }
  };

  const deleteUserEndpoint = async (
    req: DeleteUserRequest,
    res: Response
  ): Promise<void> => {
    const { username } = req.query;

    try {
      const result = await deleteUser(username);
      if ("error" in result) {
        throw new Error(username);
      }

      socket.emit('usersUpdate', username);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(500).send(`Error when deleting user: ${error.message}`);
      } else {
        res.status(500).send(`Error when deleting user`);
      }
    }
  }

  const getUserEndpoint = async (
    req: GetUserRequest,
    res: Response
  ): Promise<void> => {
    const { username } = req.params;

    try {
      const result = await getUser(username);
      if ("error" in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(500).send(`Error when getting user: ${error.message}`);
      } else {
        res.status(500).send(`Error when getting user`);
      }
    }
  };

  const getAllUsersEndpoint = async (
    req: GetUserRequest,
    res: Response
  ): Promise<void> => {
    try {
      const result = await getAllUsers();
      if ("error" in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(500).send(`Error when getting users: ${error.message}`);
      } else {
        res.status(500).send(`Error when getting users`);
      }
    }
  };

  router.post("/createUser", createUserEndpoint);
  router.delete("/deleteUser", deleteUserEndpoint);
  router.get("/getUser/:username", getUserEndpoint);
  router.get("/getAllUsers", getAllUsersEndpoint)
  return router;
};

export default userController;
