"use client";

import { useFitnessLog } from "./useFitnessLog";
import { Button, styled } from "@mui/material";
import { SessionData } from "@auth0/nextjs-auth0/server";

const LogoutButton = styled(Button)({
  border: "solid",
  borderWidth: "1px",
});

type FitnessLogProps = {
  session: SessionData;
}

export const FitnessLog = ({ session }: FitnessLogProps) => {
  const auth0_name = session.user.nickname || '';
  const { curUser } = useFitnessLog(auth0_name);

  return (
    <>
      <span>User:</span>
      {curUser ? (
        <>
          <span>{`Username: ${curUser?.username || "None"}`}</span>
          <span>{`Favorite Exercise: ${curUser?.favExercise || "None"}`}</span>
        </>
      ) : (
        <span>Not signed in</span>
      )}
      <br />
      <LogoutButton href="/auth/logout">Log Out</LogoutButton>
    </>
  );
};
