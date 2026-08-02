import { useMe, useUpdateMyEmail } from "@liftledger/api-client";
import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VerifyEmailSentDialog } from "./VerifyEmailSentDialog";
import { ProfileTextInput } from "../../profileInputs";

interface Props {
  isConnectionUser: boolean;
}

export const EmailInput = ({ isConnectionUser }: Props) => {
  const { data: curUser } = useMe();
  const { send: triggerUpdateEmail, isLoading: saving } = useUpdateMyEmail();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [verifySentFor, setVerifySentFor] = useState<string | null>(null);

  useEffect(() => {
    if (curUser) setEmail(curUser.email);
  }, [curUser]);

  const edited = useMemo(
    () => email !== (curUser?.email ?? ""),
    [email, curUser?.email],
  );

  const handleSave = useCallback(async () => {
    if (!curUser) return;
    setError("");
    try {
      await triggerUpdateEmail({ email });
      setVerifySentFor(email);
    } catch (e) {
      setError(
        isAxiosError(e) && e.response?.status === 409
          ? "That email is already in use."
          : "Failed to update email.",
      );
    }
  }, [curUser, email, triggerUpdateEmail]);

  const canSave = edited && email.trim() !== "";

  return (
    <>
      <ProfileTextInput
        label="Email"
        value={email}
        error={error}
        onChange={setEmail}
        onSave={handleSave}
        onRevert={() => setEmail(curUser?.email ?? "")}
        canSave={canSave}
        isSaving={saving}
        disabled={!isConnectionUser}
      />
      <VerifyEmailSentDialog
        open={verifySentFor !== null}
        email={verifySentFor ?? ""}
      />
    </>
  );
};
