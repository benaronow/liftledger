import { useCallback, useMemo } from "react";
import { useMe } from "../api/useMe";
import { useUpdateUser } from "../api/useUser";

const sorted = (options?: string[]) => [...(options ?? [])].sort();

export const useWeightTypeOptions = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser } = useUpdateUser();

  const allWeightTypeOptions = useMemo<string[]>(
    () => sorted(curUser?.weightTypes),
    [curUser],
  );

  const defaultWeightType = curUser?.defaultWeightType ?? "";

  const addWeightType = useCallback(
    async (value: string) => {
      if (
        !curUser ||
        allWeightTypeOptions
          .map((o) => o.toLowerCase())
          .includes(value.toLowerCase())
      )
        return;

      await triggerUpdateUser({
        ...curUser,
        weightTypes: [...(curUser.weightTypes ?? []), value],
      });
    },
    [curUser, allWeightTypeOptions, triggerUpdateUser],
  );

  // Sets the default in a single update that also adds the value to the list if
  // it's new, so selecting a freshly-typed weight type from Settings can't race
  // a separate add-then-set-default pair (which would clobber one another).
  const setDefaultWeightType = useCallback(
    async (value: string) => {
      if (!curUser) return;

      const existing = curUser.weightTypes ?? [];
      const alreadyListed = existing
        .map((o) => o.toLowerCase())
        .includes(value.toLowerCase());

      await triggerUpdateUser({
        ...curUser,
        weightTypes: alreadyListed ? existing : [...existing, value],
        defaultWeightType: value,
      });
    },
    [curUser, triggerUpdateUser],
  );

  return {
    allWeightTypeOptions,
    defaultWeightType,
    addWeightType,
    setDefaultWeightType,
  };
};
