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
import { Spinner } from "../spinner";
import { ScreenStateContext } from "@/app/providers/screenStateProvider";

export const CreateAccount = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { classes } = useCreateAccountStyles();
  const { isFetching, toggleScreenState } = useContext(ScreenStateContext);
  const { session, attemptedLogin, curUser } = useContext(LoginContext);

  useEffect(() => {
    router.prefetch(RouteType.Home);
  }, []);

  useEffect(() => {
    if (!session || (attemptedLogin && curUser)) router.push("/dashboard");
  }, [attemptedLogin]);

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
    birthday: new Date(),
  });
  const entryNames = ["First Name", "Last Name", "Birthday"];

  const handleDateInput = (value: Dayjs | null) => {
    if (value) setInput({ ...input, birthday: value.toDate() });
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === "First Name")
      setInput({ ...input, firstName: e.target.value });
    if (type === "Last Name") setInput({ ...input, lastName: e.target.value });
    if (type === "Birthday")
      setInput({ ...input, birthday: new Date(e.target.value) });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user: User = {
      ...input,
      email: session?.user.email || "",
      blocks: [],
      curBlock: "",
    };
    dispatch(updateUser(user));
  };

  if (!attemptedLogin || isFetching) return <Spinner />;

  return (
    <div className={classes.container}>
      <div className={classes.box}>
        <div className={classes.titleContainer}>
          <span className={classes.title}>Start your lifting journey!</span>
        </div>
        <form
          className={classes.form}
          id="create-account-form"
          onSubmit={handleSubmit}
        >
          {Object.values(input).map((entry, idx) => (
            <div className={classes.entry} key={idx}>
              <span
                className={classes.entryName}
              >{`${entryNames[idx]}: `}</span>
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
        <div className={classes.actions}>
          <div className={classes.buttonContainer}>
            <div
              className={`${classes.actionButton} ${classes.submitButtonBottom}`}
            />
            <button
              className={`${classes.actionButton} ${classes.submitButtonTop}`}
              form="create-account-form"
              type="submit"
            >
              Create Account
            </button>
          </div>
          <div className={classes.buttonContainer}>
            <div
              className={`${classes.actionButton} ${classes.cancelButtonBottom}`}
            />
            <button
              className={`${classes.actionButton} ${classes.cancelButtonTop}`}
              onClick={() => {
                toggleScreenState("fetching", true);
                router.push("/auth/logout");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
