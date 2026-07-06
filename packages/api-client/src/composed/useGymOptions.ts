import { useCallback, useMemo } from "react";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

export const useGymOptions = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const allGymOptions = useMemo<string[]>(
    () => [...(curUser?.gyms ?? [])].sort(),
    [curUser],
  );

  const addGym = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        allGymOptions.map((o) => o.toLowerCase()).includes(value.toLowerCase())
      )
        return;

      await triggerUpdateUser({
        ...curUser,
        gyms: [...(curUser.gyms ?? []), value],
      });
    },
    [curUser, allGymOptions, triggerUpdateUser],
  );

  const deleteGym = useCallback(
    async (value: string) => {
      if (!curUser) return;
      await triggerUpdateUser({
        ...curUser,
        gyms: (curUser.gyms ?? []).filter((o) => o !== value),
      });
    },
    [curUser, triggerUpdateUser],
  );

  return {
    allGymOptions,
    addGym,
    deleteGym,
  };
};
