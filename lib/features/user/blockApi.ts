import api from "@/lib/config";
import { Block, BlockOp } from "@/types";

const BLOCK_API_URL = "/api/block";

export const blockOpRequest = async (data: {
  uid: string;
  block: Block;
  type: BlockOp;
}) => {
  const res = await api.post(`${BLOCK_API_URL}`, data);
  const result: Block = await res.data;
  return result;
};
