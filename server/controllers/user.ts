import express, { Response } from "express";
import {
  User,
  CreateUserRequest,
  FitnessLogSocket,
  GetUserRequest,
} from "../types";
import { createUser, getAllUsers, getUser } from "../application";

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

      res.status(200).json(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when saving user: ${err.message}`);
      } else {
        res.status(500).send(`Error when saving user`);
      }
    }
  };

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when getting user: ${err.message}`);
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
      const users = await getAllUsers();
      const errorCheck = users.find((user) => "error" in user);
      if (errorCheck) {
        throw new Error("Error when getting users");
      }
      res.status(200).json(users);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when getting users: ${err.message}`);
      } else {
        res.status(500).send(`Error when getting users`);
      }
    }
  };

  router.post("/createUser", createUserEndpoint);
  router.get("/getUser/:username", getUserEndpoint);
  router.get("/getAllUsers", getAllUsersEndpoint)
  return router;
};

export default userController;
