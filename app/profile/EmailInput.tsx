import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../layoutContainer/UserProvider";
import { LabeledTextInput } from "../components/inputs";
import { ActionButton } from "../components/ActionButton";
import { Spinner } from "react-bootstrap";
import { FaSave } from "react-icons/fa";

type Props = {
  isConnectionUser: boolean;
};

export const EmailInput = ({ isConnectionUser }: Props) => {
  const { curUser, updateEmail } = useUser();
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (curUser) {
      setEmail(curUser.email);
    }
  }, [curUser?._id]);

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

  const renderEnd = useMemo(
    () =>
      isConnectionUser
        ? () => (
            <ActionButton
              variant="primary"
              height={35}
              width={35}
              roundedSide="end"
              disabled={!emailEdited || email.trim() === ""}
              icon={
                savingEmail ? (
                  <Spinner animation="border" variant="light" size="sm" />
                ) : (
                  <FaSave size={14} />
                )
              }
              onClick={handleSaveEmail}
            />
          )
        : undefined,
    [isConnectionUser, emailEdited, email, savingEmail, handleSaveEmail],
  );

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
      renderEnd={renderEnd}
      onBlur={() => setEmail(curUser?.email ?? "")}
    />
  );
};
