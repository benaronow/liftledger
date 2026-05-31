import { useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useMe } from "@liftledger/api-client";
import { LogoSpinner } from "@/components/LogoSpinner";
import { FirstNameInput } from "./FirstNameInput";
import { LastNameInput } from "./LastNameInput";
import { EmailInput } from "./EmailInput";
import { DangerZone } from "./DangerZone";
import { ActionButton } from "../components/ActionButton";
import { TbLogout2 } from "react-icons/tb";
import { ResetPasswordButton } from "./ResetPasswordButton";
import { COLORS } from "@/lib/colors";

export const Profile = () => {
  const { user: auth0User, logout } = useAuth0();
  const { data: curUser } = useMe();

  const isConnectionUser = useMemo(
    () => auth0User?.sub?.startsWith("auth0|") ?? false,
    [auth0User?.sub],
  );

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (!curUser) return <LogoSpinner />;

  return (
    <div
      className="d-flex flex-column align-items-center h-100 w-100 gap-3 overflow-scroll"
      style={{ padding: "15px 0px" }}
    >
      <div
        className="d-flex flex-column align-items-center w-100 gap-3 p-3"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.container} 30%, ${COLORS.container} 70%, transparent 100%)`,
        }}
      >
        {auth0User?.picture && (
          <img
            src={auth0User.picture}
            alt=""
            style={{
              height: "80px",
              width: "80px",
              borderRadius: "50%",
              border: "3px solid white",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <div
        className="d-flex flex-column align-items-center w-100 rounded gap-3 p-3"
        style={{ background: COLORS.dark }}
      >
        <FirstNameInput />
        <LastNameInput />
        <EmailInput isConnectionUser={isConnectionUser} />
        <ResetPasswordButton isConnectionUser={isConnectionUser} />
        <ActionButton
          label="Log Out"
          icon={<TbLogout2 fontSize={22} />}
          variant="dangerInverted"
          onClick={handleLogout}
          className="mt-3"
        />
      </div>
      <DangerZone />
    </div>
  );
};
