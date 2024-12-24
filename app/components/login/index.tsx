"use client";

import { SessionData } from "@auth0/nextjs-auth0/server";
import { useLogin } from "./useLogin";
import { Button, styled } from "@mui/material";
import { useRouter } from "next/navigation";

const LoginButton = styled(Button)({
  border: "solid",
  borderWidth: "1px",
});

type LoginProps = {
  session: SessionData | null;
};

export const Login = ({ session }: LoginProps) => {
  const router = useRouter();
  const auth0_email = session?.user.email || "";
  const { attemptedLogin, curUser } = useLogin(auth0_email);

  if (attemptedLogin && curUser) router.push("/dashboard");
  if (attemptedLogin && !curUser) router.push("/createAccount");

  return (
    <>
      <LoginButton href="/auth/login?screen_hint=signup">Sign up</LoginButton>
      <br />
      <LoginButton href="/auth/login">Log in</LoginButton>
    </>
  );
};
