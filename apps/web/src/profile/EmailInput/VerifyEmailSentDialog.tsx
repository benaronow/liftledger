import { useAuth0 } from "@auth0/auth0-react";
import { TbLogout2 } from "react-icons/tb";
import { ActionDialog, DialogAction } from "@/components/ActionDialog";

interface Props {
  open: boolean;
  email: string;
}

export const VerifyEmailSentDialog = ({ open, email }: Props) => {
  const { logout } = useAuth0();

  const handleSignOut = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const actions: DialogAction[] = [
    {
      icon: <TbLogout2 fontSize={22} />,
      onClick: handleSignOut,
      variant: "primary",
    },
  ];

  if (!open) return null;

  return (
    <ActionDialog
      open={open}
      onClose={() => {}}
      title="Verify your new email"
      actions={actions}
      saving
    >
      <div className="d-flex flex-column gap-2">
        <span className="text-white text-wrap">
          We sent a verification link to <strong>{email}</strong>.
        </span>
        <span className="text-white text-wrap">
          You&apos;ll need to verify it and sign back in before continuing.
        </span>
      </div>
    </ActionDialog>
  );
};
