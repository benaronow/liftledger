import { useMe, useUpdateMyUsername } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileTextInput } from "../profileInputs";

export const UsernameInput = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUsername, isMutating: saving } =
    useUpdateMyUsername();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (curUser) setValue(curUser.username ?? "");
  }, [curUser]);

  const edited = useMemo(
    () => value !== (curUser?.username ?? ""),
    [value, curUser],
  );

  const handleSave = useCallback(async () => {
    if (!curUser) return;
    setError("");
    try {
      await triggerUpdateUsername(value);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [curUser, value, triggerUpdateUsername]);

  const canSave = edited && value.trim() !== "";

  return (
    <ProfileTextInput
      label="Username"
      value={value}
      error={error}
      onChange={setValue}
      onSave={handleSave}
      onRevert={() => setValue(curUser?.username ?? "")}
      canSave={canSave}
      isSaving={saving}
    />
  );
};
