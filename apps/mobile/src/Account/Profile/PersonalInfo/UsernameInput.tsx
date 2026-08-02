import { useMe, useUpdateMyUsername } from "@liftledger/api-client";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileTextInput } from "../profileInputs";

export const UsernameInput = () => {
  const { data: curUser } = useMe();
  const { send: triggerUpdateUsername, isLoading: saving } =
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
      await triggerUpdateUsername({ username: value });
    } catch (e) {
      setError(
        isAxiosError(e) && e.response?.status === 409
          ? "That username is already taken."
          : "Failed to update username.",
      );
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
