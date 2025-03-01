"use client";

import { updateUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RouteType, User } from "@/types";
import { Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { LoginContext } from "../../providers/loginProvider";
import { useCreateAccountStyles } from "./useCreateAccountStyles";

export const CreateAccount = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { classes } = useCreateAccountStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);

  useEffect(() => {
    router.prefetch(RouteType.Home);
    if (!session || (attemptedLogin && curUser)) router.push("/dashboard");
  }, []);

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
      email: session?.user.email || "",
      benchMax: parseInt(input.benchMax),
      squatMax: parseInt(input.squatMax),
      deadMax: parseInt(input.deadMax),
      progress: {},
      blocks: [],
      curBlock: undefined,
    };
    dispatch(updateUser(user));
  };

  const handleLogout = () => {
    router.push(`/auth/logout`);
  };

  return (
    <div className={classes.container}>
      <span className={classes.title}>Create Account</span>
      <div className={classes.horizontalDivider} />
      <form
        className={classes.form}
        id="create-account-form"
        onSubmit={handleSubmit}
      >
        {Object.values(input).map((entry, idx) => (
          <div className={classes.entry} key={idx}>
            <span className={classes.entryName}>{`${entryNames[idx]}: `}</span>
            {entryNames[idx] === "Birthday" ? (
              <DatePicker
                className={`${classes.input} ${classes.dateInput}`}
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
      </form>
      <div className={classes.horizontalDivider} />
      <div className={classes.buttons}>
        <button
          className={classes.accountButton}
          form="create-account-form"
          type="submit"
        >
          Save Info
        </button>
        <button className={classes.deleteButton} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
};
