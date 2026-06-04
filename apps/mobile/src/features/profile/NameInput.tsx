import { Ionicons } from "@expo/vector-icons";
import { useMe, useUpdateUser } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { LabeledTextInput } from "../../components/inputs";

interface Props {
  field: "firstName" | "lastName";
  label: string;
  placeholder: string;
}

// First/last name share identical edit-then-save logic; the only difference is
// which User field they bind to, so they're one parameterized input.
export const NameInput = ({ field, label, placeholder }: Props) => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser, isMutating: saving } = useUpdateUser();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (curUser) setValue(curUser[field] ?? "");
  }, [curUser, field]);

  const edited = useMemo(
    () => value !== (curUser?.[field] ?? ""),
    [value, curUser, field],
  );

  const handleSave = useCallback(async () => {
    if (!curUser) return;
    setError("");
    try {
      await triggerUpdateUser({ ...curUser, [field]: value });
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  }, [curUser, field, value, triggerUpdateUser]);

  const disabled = !edited || value.trim() === "";

  return (
    <LabeledTextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={(text) => {
        setValue(text);
        setError("");
      }}
      error={error}
      renderEnd={() => (
        <ActionButton
          variant="primary"
          height={35}
          width={35}
          roundedSide="end"
          disabled={disabled}
          icon={
            saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="save" size={14} color="white" />
            )
          }
          onPress={handleSave}
        />
      )}
    />
  );
};
