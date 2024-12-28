"use client";

import { createUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { User } from "@/types";
import { SessionData } from "@auth0/nextjs-auth0/server";
import { Box, Button, Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useCreateAccount } from "./useCreateAccount";
import { makeStyles } from "tss-react/mui";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    flex: '1',
    position: "absolute",
    top: "60px",
    width: '100%',
    padding: '10px 10px 0px 10px',
    background: 'gray',
    height: 'calc(100vh - 60px)',
    alignItems: 'center',
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    width: "100%",
    justifyContent: "flex-end",
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    width: "170px",
  },
  submitButton: {
    marginTop: "10px",
    border: "solid",
    borderWidth: "1px",
  },
});

const boxStyle = {
  background: "white",
  outline: 0,
  border: "solid",
  borderColor: "lightgray",
  borderRadius: "25px",
  padding: "10px 10px 10px 10px",
  width: '100%',
  maxWidth: '350px'
};

interface CreateAccountProps {
  session: SessionData | null;
}

export const CreateAccount = ({ session }: CreateAccountProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { classes } = useStyles();

  const email = session?.user.email || "";
  const { attemptedLogin, curUser } = useCreateAccount(email);
  if (!email) router.push("/");
  if (attemptedLogin && curUser) router.push("/dashboard");

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
    birthday: new Date(),
    benchMax: "",
    squatMax: "",
    deadMax: "",
  });
  const entryNames = [
    "First Name",
    "Last Name",
    "Birthday",
    "Bench Max",
    "Squat Max",
    "Deadlift Max",
  ];

  const handleDateInput = (value: Dayjs | null) => {
    if (value) setInput({ ...input, birthday: value.toDate() });
  };

  const isNumber = (value: string) => {
    return !value || !isNaN(Number(value));
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === "First Name")
      setInput({ ...input, firstName: e.target.value });
    if (type === "Last Name") setInput({ ...input, lastName: e.target.value });
    if (type === "Birthday")
      setInput({ ...input, birthday: new Date(e.target.value) });
    if (type === "Bench Max" && isNumber(e.target.value))
      setInput({ ...input, benchMax: e.target.value });
    if (type === "Squat Max" && isNumber(e.target.value))
      setInput({ ...input, squatMax: e.target.value });
    if (type === "Deadlift Max" && isNumber(e.target.value))
      setInput({ ...input, deadMax: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user: User = {
      ...input,
      email,
      benchMax: parseInt(input.benchMax),
      squatMax: parseInt(input.squatMax),
      deadMax: parseInt(input.deadMax),
      blocks: [],
      curBlock: undefined,
    };
    dispatch(createUser(user));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={classes.container}>
        <Box sx={boxStyle}>
          <form className={classes.form} onSubmit={handleSubmit}>
            <span>Create Account</span>
            {Object.values(input).map((entry, idx) => (
              <div className={classes.entry} key={idx}>
                <span>{`${entryNames[idx]}: `}</span>
                {entryNames[idx] === "Birthday" ? (
                  <DatePicker
                    className={classes.input}
                    onChange={(value: Dayjs | null) => handleDateInput(value)}
                  />
                ) : (
                  <Input
                    className={classes.input}
                    value={entry}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleInput(e, entryNames[idx])
                    }
                  ></Input>
                )}
              </div>
            ))}
            <Button className={classes.submitButton} type="submit">
              Submit
            </Button>
          </form>
        </Box>
      </div>
    </LocalizationProvider>
  );
};
