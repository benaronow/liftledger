import { useAuth0 } from "react-native-auth0";
import { useMemo } from "react";
import { SectionCard } from "../../../components/SectionCard";
import { EmailInput } from "./EmailInput";
import { NameInput } from "./NameInput";
import { UsernameInput } from "./UsernameInput";
import { ResetPasswordButton } from "./ResetPasswordButton";

export const PersonalInfo = () => {
  const { user: auth0User } = useAuth0();

  const isConnectionUser = useMemo(
    () => auth0User?.sub?.startsWith("auth0|") ?? false,
    [auth0User?.sub],
  );

  return (
    <SectionCard title="Personal Info">
      <NameInput />
      <EmailInput isConnectionUser={isConnectionUser} />
      <UsernameInput />
      <ResetPasswordButton isConnectionUser={isConnectionUser} />
    </SectionCard>
  );
};
