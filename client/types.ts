import { Socket } from "socket.io-client";

export type FitnessLogSocket = Socket<ServerToClientEvents>;

export interface ServerToClientEvents {
  usersUpdate: (username: string) => void;
}

export interface User {
  _id?: string;
  username: string;
  password: string;
  favExercise: string;
}
