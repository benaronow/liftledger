import { useMe, useUpdateUser } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileTextInput } from "../profileInputs";

export const NameInput = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser, isMutating: saving } = useUpdateUser();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (curUser) setValue(curUser.fullName ?? "");
  }, [curUser]);

  const edited = useMemo(
    () => value !== (curUser?.fullName ?? ""),
    [value, curUser],
  );

  const handleSave = useCallback(async () => {
    if (!curUser) return;
    setError("");
    try {
      await triggerUpdateUser({ ...curUser, fullName: value });
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [curUser, value, triggerUpdateUser]);

  const canSave = edited && value.trim() !== "";

  return (
    <ProfileTextInput
      label="Full name"
      value={value}
      error={error}
      onChange={setValue}
      onSave={handleSave}
      onRevert={() => setValue(curUser?.fullName ?? "")}
      canSave={canSave}
      isSaving={saving}
    />
  );
};
