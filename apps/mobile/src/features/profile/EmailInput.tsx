import { Ionicons } from "@expo/vector-icons";
import { useMe, useUpdateMyEmail } from "@liftledger/api-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";
import { ActionButton } from "../../components/ActionButton";
import { LabeledTextInput } from "../../components/inputs";
import { VerifyEmailSentDialog } from "./VerifyEmailSentDialog";

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

  const disabled = !edited || email.trim() === "";

  return (
    <>
      <LabeledTextInput
        label="Email"
        placeholder="Enter email..."
        value={email}
        keyboardType="email-address"
        editable={isConnectionUser}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        error={error}
        renderEnd={
          isConnectionUser
            ? () => (
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
              )
            : undefined
        }
      />
      <VerifyEmailSentDialog
        open={verifySentFor !== null}
        email={verifySentFor ?? ""}
      />
    </>
  );
};
