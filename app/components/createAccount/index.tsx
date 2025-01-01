import { createUser } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { User } from "@/types";
import { Box, Input } from "@mui/material";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { LoginContext } from "../providers/loginContext";

const useStyles = makeStyles()({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: "Gabarito",
    fontWeight: 900,
    fontSize: "22px",
    marginBottom: "10px",
  },
  divider: {
    width: "105%",
    height: "2px",
    background: "black",
    marginBottom: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  entry: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%",
    justifyContent: "flex-start",
  },
  entryName: {
    fontFamily: "Gabarito",
    width: "60%",
    fontWeight: 600,
    fontSize: "16px",
  },
  input: {
    border: "solid",
    borderColor: "gray",
    borderWidth: "1px",
    borderRadius: "5px",
    marginLeft: "5px",
    width: "100%",
    paddingLeft: "5px",
    fontSize: "16px",
  },
  dateInput: {
    paddingLeft: "0px",
  },
  buttons: {
    display: "flex",
    width: "70%",
    justifyContent: "space-around",
  },
  accountButton: {
    border: "none",
    background: "transparent",
    fontFamily: "Gabarito",
    fontSize: "16px",
    color: "#0096FF",
  },
  deleteButton: {
    border: "none",
    background: "transparent",
    fontFamily: "Gabarito",
    fontSize: "16px",
    color: "#FF0000",
  },
});

const boxStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "white",
  outline: 0,
  border: "none",
  borderRadius: "25px 25px 25px 25px",
  padding: "0px 10px 0px 10px",
  width: "100%",
  maxWidth: "400px",
  marginBottom: "10px",
};

export const CreateAccount = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { classes } = useStyles();
  const { session, attemptedLogin, curUser } = useContext(LoginContext);
  if (!session || (attemptedLogin && curUser)) router.push("/dashboard");

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
      blocks: [],
      curBlock: undefined,
    };
    dispatch(createUser(user));
  };

  const handleLogout = () => {
    router.push(`/auth/logout`);
  };

  return (
    <div className={classes.container}>
      <Box sx={boxStyle}>
        <span className={classes.title}>Create Account</span>
        <div className={classes.divider} />
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
        <div className={classes.divider} />
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
      </Box>
    </div>
  );
};
