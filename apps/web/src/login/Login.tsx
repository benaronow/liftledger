import { ActionButton } from "@/components/ActionButton";
import { useAuth0 } from "@auth0/auth0-react";
import { BiLogIn } from "react-icons/bi";

export const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div
      className="d-flex flex-column h-100 w-100 align-items-center justify-content-center gap-4"
      style={{ padding: "15px 0px" }}
    >
      <span
        className="text-white"
        style={{
          fontFamily: "League+Spartan",
          fontWeight: 900,
          fontSize: "24px",
        }}
      >
        Welcome to LiftLedger!
      </span>
      <ActionButton
        label="Log in"
        icon={<BiLogIn fontSize={24} />}
        onClick={() => {
          loginWithRedirect();
        }}
        width="auto"
      />
    </div>
  );
};
