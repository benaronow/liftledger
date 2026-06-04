import { useState } from "react";
import { ActionButton } from "../../components/ActionButton";
import { TbLockPassword } from "react-icons/tb";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

type Props = {
  isConnectionUser: boolean;
};

export const ResetPasswordButton = ({ isConnectionUser }: Props) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  if (!isConnectionUser) return null;

  return (
    <>
      <ActionButton
        label="Reset Password"
        icon={<TbLockPassword fontSize={22} />}
        variant="dangerInverted"
        onClick={() => setResetDialogOpen(true)}
        className="mt-3"
      />
      <ResetPasswordDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      />
    </>
  );
};
