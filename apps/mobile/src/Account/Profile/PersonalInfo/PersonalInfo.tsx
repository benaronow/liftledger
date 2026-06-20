import { Surface } from "react-native-paper";
import { Text } from "../../../paper";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { EmailInput } from "./EmailInput";
import { NameInput } from "./NameInput";
import { UsernameInput } from "./UsernameInput";
import { ResetPasswordButton } from "./ResetPasswordButton";
import { useTheme } from "../../../paper";
import { useAuth0 } from "react-native-auth0";
import { useMemo } from "react";
import { BirthdayInput } from "./BirthdayInput";

export const PersonalInfo = () => {
  const { user: auth0User } = useAuth0();
  const { colors } = useTheme();

  const isConnectionUser = useMemo(
    () => auth0User?.sub?.startsWith("auth0|") ?? false,
    [auth0User?.sub],
  );

  return (
    <Surface
      elevation={1}
      style={{
        width: "100%",
        borderRadius: RADIUS.md,
        gap: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: colors.container,
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: FONT.base,
          fontWeight: "800",
          alignSelf: "flex-start",
        }}
      >
        Personal Info
      </Text>
      <NameInput />
      <UsernameInput />
      <BirthdayInput />
      <EmailInput isConnectionUser={isConnectionUser} />
      <ResetPasswordButton isConnectionUser={isConnectionUser} />
    </Surface>
  );
};
