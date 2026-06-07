import { useState } from "react";
import { Button, useTheme } from "../../../../paper";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { SPACING } from "../../../../theme";

interface Props {
  isConnectionUser: boolean;
}

export const ResetPasswordButton = ({ isConnectionUser }: Props) => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  if (!isConnectionUser) return null;

  return (
    <>
      <Button
        style={{
          flexDirection: "column",
          height: 45,
          marginTop: SPACING.sm,
          justifyContent: "center",
        }}
        buttonColor="white"
        textColor={colors.danger}
        mode="contained"
        icon="lock-outline"
        onPress={() => setOpen(true)}
      >
        Reset Password
      </Button>
      <ResetPasswordDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};
