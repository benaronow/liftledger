import { useCallback, useMemo } from "react";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

const sorted = (options?: string[]) => [...(options ?? [])].sort();

export const useUnitOptions = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const allUnitOptions = useMemo<string[]>(
    () => sorted(curUser?.units),
    [curUser],
  );

  const defaultUnit = curUser?.defaultUnit ?? "";

  const addUnit = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        allUnitOptions.map((o) => o.toLowerCase()).includes(value.toLowerCase())
      )
        return;

      await triggerUpdateUser({
        ...curUser,
        units: [...(curUser.units ?? []), value],
      });
    },
    [curUser, allUnitOptions, triggerUpdateUser],
  );

  const deleteUnit = useCallback(
    async (value: string) => {
      if (!curUser) return;
      await triggerUpdateUser({
        ...curUser,
        units: (curUser.units ?? []).filter((o) => o !== value),
      });
    },
    [curUser, triggerUpdateUser],
  );

  // Sets the default in a single update that also adds the value to the list if
  // it's new, so selecting a freshly-typed unit from Settings can't race a
  // separate add-then-set-default pair (which would clobber one another).
  const setDefaultUnit = useCallback(
    async (value: string) => {
      if (!curUser) return;

      const existing = curUser.units ?? [];
      const alreadyListed = existing
        .map((o) => o.toLowerCase())
        .includes(value.toLowerCase());

      await triggerUpdateUser({
        ...curUser,
        units: alreadyListed ? existing : [...existing, value],
        defaultUnit: value,
      });
    },
    [curUser, triggerUpdateUser],
  );

  return {
    allUnitOptions,
    defaultUnit,
    addUnit,
    deleteUnit,
    setDefaultUnit,
  };
};
