import api from "@/lib/config";
import { User } from "@/types";
import { socket } from "@/socket";

export const createUserRequest = async (
  username: string,
  password: string,
  favExercise: string
) => {
  const user: User = {
    username: username,
    password: password,
    favExercise: favExercise,
  };
  const res = await api.post(`http://localhost:3000/api/user`, user);
  const result: User = await res.data;
  socket.emit('usersUpdate', username);
  return result;
};

export const deleteUserRequest = async (username: string) => {
  const res = await api.delete(`http://localhost:3000/api/user?username=${username}`);
  const result: { acknowledged: boolean, deletedCount: number } = await res.data;
  socket.emit('usersUpdate', username);
  return result;
}

export const getUserRequest = async (username: string) => {
  const res = await api.get(`http://localhost:3000/api/user/${username}`);
  const result: User = await res.data;
  return result;
};

export const getAllUsersRequest = async () => {
  const res = await api.get(`http://localhost:3000/api/users`);
  const result: User[] = await res.data.data;
  return result;
};
