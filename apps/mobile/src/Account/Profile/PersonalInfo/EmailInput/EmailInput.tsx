import { useMe, useUpdateMyEmail } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VerifyEmailSentDialog } from "./VerifyEmailSentDialog";
import { ProfileTextInput } from "../../profileInputs";

interface Props {
  // Only database-connection users can change their email; social logins can't.
  isConnectionUser: boolean;
}

export const EmailInput = ({ isConnectionUser }: Props) => {
  const { data: curUser } = useMe();
  const { trigger: triggerUpdateEmail, isMutating: saving } =
    useUpdateMyEmail();
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
      await triggerUpdateEmail(email);
      setVerifySentFor(email);
    } catch (e: unknown) {
      setError((e as Error).message);
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
