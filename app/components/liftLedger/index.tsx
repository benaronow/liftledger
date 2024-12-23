"use client";

import { useLiftLedger } from "./useLiftLedger";
import { Button, styled } from "@mui/material";
import { SessionData } from "@auth0/nextjs-auth0/server";

const LoginButton = styled(Button)({
  border: "solid",
  borderWidth: "1px",
});

type LiftLedgerProps = {
  session: SessionData | null;
};

export const LiftLedger = ({ session }: LiftLedgerProps) => {
  const auth0_email = session?.user.email || "";
  const { curUser, handleDelete } = useLiftLedger(auth0_email);

  return session ? (
    <>
      <span>User:</span>
      <span>{`Name: ${
        curUser?.firstName + " " + curUser?.lastName || "None"
      }`}</span>
      <LoginButton href="/auth/logout">Log Out</LoginButton>
      <br />
      <LoginButton href="/auth/logout" onClick={handleDelete}>
        Delete Account
      </LoginButton>
    </>
  ) : (
    <span>Something went wrong</span>
  );
};
