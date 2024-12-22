"use client";

import { useLiftLedger } from "./useLiftLedger";
import { Button, styled } from "@mui/material";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { CreateAccount } from "../createAccount";

const LoginButton = styled(Button)({
  border: "solid",
  borderWidth: "1px",
});

type LiftLedgerProps = {
  session: SessionData | null;
};

export const LiftLedger = ({ session }: LiftLedgerProps) => {
  const auth0_email = session?.user.email || "";
  const { attemptedLogin, curUser, handleDelete } = useLiftLedger(auth0_email);

  // If logged in through auth0 but have not fetched user data display loading
  if (session && !attemptedLogin) return <span>Loading</span>;

  return session ? (
    <>
      {!curUser ? (
        <CreateAccount email={auth0_email} />
      ) : (
        <>
          <span>User:</span>
          <span>{`Name: ${
            curUser?.firstName + " " + curUser?.lastName || "None"
          }`}</span>
        </>
      )}
      <br />
      <LoginButton href="/auth/logout">Log Out</LoginButton>
      <br />
      <LoginButton href="/auth/logout" onClick={handleDelete}>Delete Account</LoginButton>
    </>
  ) : (
    <>
      <LoginButton href="/auth/login?screen_hint=signup">Sign up</LoginButton>
      <br />
      <LoginButton href="/auth/login">Log in</LoginButton>
    </>
  );
};
