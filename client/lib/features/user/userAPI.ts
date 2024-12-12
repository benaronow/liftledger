import api from "@/lib/config";
import { User } from "@/types";

const USER_API_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/user`;

// A mock function to mimic making an async request for data
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
  const res = await api.post(`${USER_API_URL}/createUser`, user);
  const result: User = await res.data.json();
  return result;
};

export const getUserRequest = async (username: string) => {
  const res = await api.get(`${USER_API_URL}/getUser/${username}`);
  const result: User = await res.data.json();
  return result;
};

export const getAllUsersRequest = async () => {
  const res = await api.get(`${USER_API_URL}/getAllUsers`);
  const result: User[] = await res.data.json();
  return result;
};
