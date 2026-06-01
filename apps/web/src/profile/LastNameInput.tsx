import { Spinner } from "react-bootstrap";
import { ActionButton } from "../components/ActionButton";
import { LabeledTextInput } from "../components/inputs";
import { FaSave } from "react-icons/fa";
import { FocusEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useMe, useUpdateUser } from "@liftledger/api-client";
import { COLORS } from "@liftledger/shared";

export const LastNameInput = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser, isMutating: savingLastName } =
    useUpdateUser();
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (curUser) {
      setLastName(curUser.lastName ?? "");
    }
  }, [curUser]);

  const lastNameEdited = useMemo(
    () => lastName !== (curUser?.lastName ?? ""),
    [lastName, curUser?.lastName],
  );

  const handleSaveLastName = useCallback(async () => {
    if (!curUser) return;
    setLastNameError("");
    try {
      await triggerUpdateUser({ ...curUser, lastName });
    } catch (e: unknown) {
      setLastNameError((e as Error).message);
    }
  }, [curUser, lastName, triggerUpdateUser]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setLastName(curUser?.lastName ?? "");
      setFocused(false);
    },
    [curUser?.lastName],
  );

  const renderEnd = useCallback(() => {
    const disabled = !lastNameEdited || lastName.trim() === "";
    const outline = focused
      ? `solid 2px ${disabled ? COLORS.primaryDisabled : COLORS.primary}`
      : undefined;

    return (
      <ActionButton
        variant="primary"
        height={35}
        width={35}
        roundedSide="end"
        disabled={disabled}
        icon={
          savingLastName ? (
            <Spinner animation="border" variant="light" size="sm" />
          ) : (
            <FaSave size={14} />
          )
        }
        onClick={handleSaveLastName}
        style={{ outline }}
      />
    );
  }, [lastNameEdited, lastName, savingLastName, handleSaveLastName, focused]);

  return (
    <LabeledTextInput
      label="Last Name"
      placeholder="Enter last name..."
      value={lastName}
      onChange={(e) => {
        setLastName(e.target.value);
        setLastNameError("");
      }}
      error={lastNameError}
      renderEnd={renderEnd}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    />
  );
};
