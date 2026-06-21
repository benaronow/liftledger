import { useMe, useUpdateMyName } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileTextInput } from "../profileInputs";

export const NameInput = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateName, isMutating: saving } = useUpdateMyName();
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
      await triggerUpdateName(value);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [curUser, value, triggerUpdateName]);

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
