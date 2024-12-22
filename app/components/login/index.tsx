"use client";

import { Button, styled } from "@mui/material";

const LoginButton = styled(Button)({
  border: "solid",
  borderWidth: "1px",
});

export const Login = () => {
  return (
    <main>
      <LoginButton href="/auth/login?screen_hint=signup">Sign up</LoginButton>
      <LoginButton href="/auth/login">Log in</LoginButton>
    </main>
  );
}
