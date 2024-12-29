import api from "@/lib/config";
import { Block, BlockOp, User } from "@/types";

const USER_API_URL = "/api/user";
const BLOCK_API_URL = "/api/block";

export const loginUserRequest = async (email: string) => {
  const res = await api.get(`${USER_API_URL}/${email}`);
  const result: User = await res.data;
  return result;
};

export const createUserRequest = async (user: User) => {
  const res = await api.post(`${USER_API_URL}`, user);
  const result: User = await res.data;
  return result;
};

export const deleteUserRequest = async (email: string) => {
  const res = await api.delete(`${USER_API_URL}?email=${email}`);
  const result: { acknowledged: boolean; deletedCount: number } =
    await res.data;
  return result;
};

export const getAllUsersRequest = async () => {
  const res = await api.get(`${USER_API_URL}`);
  const result: User[] = await res.data;
  return result;
};

export const blockOpRequest = async (data: {
  uid: string;
  block: Block;
  type: BlockOp;
}) => {
  const res = await api.post(`${BLOCK_API_URL}`, data);
  const result: Block = await res.data;
  return result;
};
