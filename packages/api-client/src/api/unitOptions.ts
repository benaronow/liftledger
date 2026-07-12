import type { User } from "@liftledger/shared";
import { usePut } from "../fetcher";
import { useMe } from "./me";
import {
  useOptions,
  useAddOption,
  useRenameOption,
  useRemoveOption,
  useOptionsBasePath,
  syncCaches,
} from "./options";

export const useUnitOptions = () => useOptions("units");
export const useAddUnit = () => useAddOption("units");
export const useRenameUnit = () => useRenameOption("units");
export const useRemoveUnit = () => useRemoveOption("units");

export const useDefaultUnit = () => {
  const { data: curUser } = useMe();
  return curUser?.options?.defaultUnit ?? "";
};

export const useSetDefaultUnit = () => {
  const basePath = useOptionsBasePath("units");
  return usePut<{ defaultUnit: string }, User>(`${basePath}/default`, {
    onSuccess: (user) => syncCaches(basePath, user),
  });
};
