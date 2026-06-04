import { FocusEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useMe, useUpdateUser } from "@liftledger/api-client";
import { LabeledTextInput } from "../components/inputs";
import { ActionButton } from "../components/ActionButton";
import { Spinner } from "react-bootstrap";
import { FaSave } from "react-icons/fa";
import { COLORS } from "@liftledger/shared";

export const FirstNameInput = () => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateUser, isMutating: savingFirstName } =
    useUpdateUser();
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (curUser) {
      setFirstName(curUser.firstName ?? "");
    }
  }, [curUser]);

  const firstNameEdited = useMemo(
    () => firstName !== (curUser?.firstName ?? ""),
    [firstName, curUser?.firstName],
  );

  const handleSaveFirstName = useCallback(async () => {
    if (!curUser) return;
    setFirstNameError("");
    try {
      await triggerUpdateUser({ ...curUser, firstName });
    } catch (e: unknown) {
      setFirstNameError((e as Error).message);
    }
  }, [curUser, firstName, triggerUpdateUser]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setFirstName(curUser?.firstName ?? "");
      setFocused(false);
    },
    [curUser?.firstName],
  );

  const renderEnd = useCallback(() => {
    const disabled = !firstNameEdited || firstName.trim() === "";
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
          savingFirstName ? (
            <Spinner animation="border" variant="light" size="sm" />
          ) : (
            <FaSave size={14} />
          )
        }
        onClick={handleSaveFirstName}
        style={{ outline }}
      />
    );
  }, [
    firstNameEdited,
    firstName,
    savingFirstName,
    handleSaveFirstName,
    focused,
  ]);

  return (
    <LabeledTextInput
      label="First Name"
      placeholder="Enter first name..."
      value={firstName}
      onChange={(e) => {
        setFirstName(e.target.value);
        setFirstNameError("");
      }}
      error={firstNameError}
      renderEnd={renderEnd}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    />
  );
};
