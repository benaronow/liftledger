import { mutate } from "swr";
import type { User } from "@liftledger/shared";
import { usePost } from "../fetcher";
import { ME_BASE_PATH } from "./me";

export const useCreateUser = () =>
  usePost<Partial<User>, User>("/users", {
    onSuccess: (user) => propagateUserToCaches(user),
  });

export const propagateUserToCaches = async (user: User) => {
  await mutate(ME_BASE_PATH, user, { revalidate: false });
};
