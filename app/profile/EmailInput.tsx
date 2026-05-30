import { FocusEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../layoutContainer/UserProvider";
import { LabeledTextInput } from "../components/inputs";
import { ActionButton } from "../components/ActionButton";
import { Spinner } from "react-bootstrap";
import { FaSave } from "react-icons/fa";
import { COLORS } from "@/lib/colors";

type Props = {
  isConnectionUser: boolean;
};

export const EmailInput = ({ isConnectionUser }: Props) => {
  const { curUser, updateEmail } = useUser();
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (curUser) {
      setEmail(curUser.email);
    }
  }, [curUser]);

  const emailEdited = useMemo(
    () => email !== (curUser?.email ?? ""),
    [email, curUser?.email],
  );

  const handleSaveEmail = useCallback(async () => {
    if (!curUser) return;
    setEmailError("");
    setSavingEmail(true);
    try {
      await updateEmail(email);
    } catch (e: unknown) {
      setEmailError((e as Error).message);
    } finally {
      setSavingEmail(false);
    }
  }, [curUser, email, updateEmail]);

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      setEmail(curUser?.email ?? "");
      setFocused(false);
    },
    [curUser?.email],
  );

  const renderEnd = useCallback(() => {
    const disabled = !emailEdited || email.trim() === "";
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
          savingEmail ? (
            <Spinner animation="border" variant="light" size="sm" />
          ) : (
            <FaSave size={14} />
          )
        }
        onClick={handleSaveEmail}
        style={{ outline }}
      />
    );
  }, [emailEdited, email, savingEmail, handleSaveEmail, focused]);

  return (
    <LabeledTextInput
      label="Email"
      placeholder="Enter email..."
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        setEmailError("");
      }}
      disabled={!isConnectionUser}
      error={emailError}
      renderEnd={isConnectionUser ? renderEnd : undefined}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    />
  );
};
