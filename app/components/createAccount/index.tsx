"use client";

import { createUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { User } from "@/types";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { Input, styled } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useCreateAccount } from "./useCreateAccount";

const AccountEntry = styled("div")({
  display: "flex",
});

const AccountInput = styled(Input)({
  border: "solid",
  borderWidth: "1px",
});

type CreateAccountProps = {
  session: SessionData | null;
};

export const CreateAccount = ({ session }: CreateAccountProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const email = session?.user.email || "";
  const { attemptedLogin, curUser } = useCreateAccount(email);
  if (!email) router.push("/");
  if (attemptedLogin && curUser) router.push("/dashboard");

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
    birthday: new Date(),
    curBenchMax: 0,
    curSquatMax: 0,
    curDeadMax: 0,
  });
  const entryNames = [
    "First Name",
    "Last Name",
    "Birthday",
    "Current Bench Max",
    "Current Squat Max",
    "Current Deadlift Max",
  ];

  const handleInput = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === "First Name")
      setInput({ ...input, firstName: e.target.value });
    if (type === "Last Name") setInput({ ...input, lastName: e.target.value });
    if (type === "Birthday")
      setInput({ ...input, birthday: new Date(e.target.value) });
    if (type === "Current Bench Max")
      setInput({ ...input, curBenchMax: parseInt(e.target.value) });
    if (type === "Current Squat Max")
      setInput({ ...input, curSquatMax: parseInt(e.target.value) });
    if (type === "Current Deadlift Max")
      setInput({ ...input, curDeadMax: parseInt(e.target.value) });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user: User = { email, ...input };
    dispatch(createUser(user));
  };

  return (
    <form onSubmit={handleSubmit}>
      {Object.values(input).map((entry, idx) => (
        <AccountEntry key={idx}>
          <span>{entryNames[idx]}</span>
          <AccountInput
            value={entry}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInput(e, entryNames[idx])
            }
          ></AccountInput>
        </AccountEntry>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};
