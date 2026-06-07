import { useMe, useUpdateUser } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileDateInput } from "../profileInputs";

export const BirthdayInput = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser, isMutating: saving } = useUpdateUser();
  const [value, setValue] = useState<Date | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (curUser)
      setValue(curUser.birthday ? new Date(curUser.birthday) : undefined);
  }, [curUser]);

  const edited = useMemo(
    () => value?.toISOString() !== (curUser?.birthday ?? ""),
    [value, curUser],
  );

  const handleSave = useCallback(async () => {
    if (!curUser) return;
    setError("");
    try {
      await triggerUpdateUser({
        ...curUser,
        birthday: value?.toISOString() ?? "",
      });
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [curUser, value, triggerUpdateUser]);

  const canSave = edited && value !== undefined;

  return (
    <ProfileDateInput
      label="Birthday"
      value={value}
      error={error}
      onChange={setValue}
      onSave={handleSave}
      onRevert={() =>
        setValue(curUser?.birthday ? new Date(curUser.birthday) : undefined)
      }
      canSave={canSave}
      isSaving={saving}
    />
  );
};
